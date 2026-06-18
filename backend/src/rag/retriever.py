import numpy as np
from sentence_transformers import CrossEncoder
from src.rag.vector_store import VectorStore, SearchResult
from src.rag.bm25_index import BM25IndexManager
from src.rag.embedder import embed_query

# Load cross encoder once
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2", max_length=512)

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

class HybridRetriever:
    def __init__(self, vector_store: VectorStore, bm25_manager: BM25IndexManager):
        self.vector_store = vector_store
        self.bm25_manager = bm25_manager

    def retrieve(self, query: str, n_results: int, doc_filter: list[str] | None = None) -> list[SearchResult]:
        query_embedding = embed_query(query)
        
        # 1. Retrieve candidates
        # Fetch top 20 from both
        vector_results = self.vector_store.search(query_embedding, 20, doc_filter)
        bm25_results = self.bm25_manager.search(query, 20, doc_filter)
        
        # 2. RRF Fusion
        fused_scores = {}
        candidate_chunks = {}
        
        def add_to_fusion(results, weight):
            for rank, res in enumerate(results):
                if res.chunk_id not in fused_scores:
                    fused_scores[res.chunk_id] = 0
                    candidate_chunks[res.chunk_id] = res
                # RRF formula: 1 / (k + rank), commonly k=60
                fused_scores[res.chunk_id] += weight * (1.0 / (60 + rank))
                
        add_to_fusion(vector_results, 0.6)
        add_to_fusion(bm25_results, 0.4)
        
        # Sort by fused score and take top 20 unique candidates
        sorted_candidates = sorted(fused_scores.items(), key=lambda x: x[1], reverse=True)
        top_candidates = [candidate_chunks[cid] for cid, _ in sorted_candidates[:20]]
        
        if not top_candidates:
            return []
            
        # 3. Cross-Encoder Reranking
        pairs = [[query, c.text] for c in top_candidates]
        cross_scores = reranker.predict(pairs)
        
        for c, score in zip(top_candidates, cross_scores):
            # Sigmoid to normalize score to 0.0-1.0 roughly
            c.score = float(sigmoid(score))
            
        # Sort by reranker score
        top_candidates.sort(key=lambda x: x.score, reverse=True)
        
        # Group results by source to ensure LLM gets context from multiple documents if possible
        final_results = []
        source_counts = {}
        
        # First pass: try to pick up to 3 chunks per source
        for c in top_candidates:
            if len(final_results) >= n_results:
                break
            
            src = c.source_file
            if source_counts.get(src, 0) < 3:
                final_results.append(c)
                source_counts[src] = source_counts.get(src, 0) + 1
                
        # If we still need more, take the rest
        if len(final_results) < n_results:
            for c in top_candidates:
                if len(final_results) >= n_results:
                    break
                if c not in final_results:
                    final_results.append(c)
                    
        return sorted(final_results, key=lambda x: x.score, reverse=True)
