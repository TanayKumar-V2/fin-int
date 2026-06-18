import os
import pickle
import string
from rank_bm25 import BM25Okapi
from src.config import settings
from src.models.document import DocumentChunk
from src.rag.vector_store import SearchResult

# Minimal set of stop words
STOPWORDS = {"the", "a", "an", "and", "or", "but", "if", "then", "else", "when", "in", "on", "at", "to", "for", "with", "by", "of", "from", "is", "are", "was", "were", "be", "been", "this", "that", "it", "they", "he", "she"}

def tokenize(text: str) -> list[str]:
    text = text.lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    tokens = text.split()
    return [t for t in tokens if t not in STOPWORDS]

class BM25IndexManager:
    def __init__(self):
        os.makedirs(settings.BM25_INDEX_DIR, exist_ok=True)
        self.index_path = os.path.join(settings.BM25_INDEX_DIR, "bm25.pkl")
        self.chunks = []
        self.bm25 = None
        self.load()

    def build_index(self, chunks: list[DocumentChunk]):
        self.chunks = chunks
        if chunks:
            tokenized_corpus = [tokenize(chunk.text) for chunk in chunks]
            self.bm25 = BM25Okapi(tokenized_corpus)
        else:
            self.bm25 = None
        self.save()
        
    def add_chunks(self, new_chunks: list[DocumentChunk]):
        # Rebuild entirely
        self.build_index(self.chunks + new_chunks)
        
    def remove_document(self, doc_id: str):
        self.chunks = [c for c in self.chunks if c.id.rsplit('_', 1)[0] != doc_id]
        self.build_index(self.chunks)

    def search(self, query: str, n_results: int, filter_doc_ids: list[str] | None = None) -> list[SearchResult]:
        if not self.bm25 or not self.chunks:
            return []
            
        tokenized_query = tokenize(query)
        scores = self.bm25.get_scores(tokenized_query)
        
        results = []
        for i, score in enumerate(scores):
            chunk = self.chunks[i]
            
            # apply filter
            if filter_doc_ids:
                doc_id = chunk.id.rsplit('_', 1)[0]
                if doc_id not in filter_doc_ids:
                    continue
                    
            if score > 0:
                results.append((score, chunk))
                
        # sort by score desc
        results.sort(key=lambda x: x[0], reverse=True)
        
        search_results = []
        for score, chunk in results[:n_results]:
            search_results.append(SearchResult(
                chunk_id=chunk.id,
                text=chunk.text,
                score=score,
                source_file=chunk.source_file,
                page_number=chunk.page_number,
                section=chunk.section,
                doc_type=chunk.doc_type,
                chunk_index=chunk.chunk_index
            ))
        return search_results

    def save(self):
        with open(self.index_path, "wb") as f:
            pickle.dump((self.chunks, self.bm25), f)

    def load(self):
        if os.path.exists(self.index_path):
            try:
                with open(self.index_path, "rb") as f:
                    self.chunks, self.bm25 = pickle.load(f)
            except Exception:
                self.chunks = []
                self.bm25 = None
