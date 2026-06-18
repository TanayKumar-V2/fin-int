import os
import chromadb
from pydantic.dataclasses import dataclass
from src.config import settings
from src.models.document import DocumentChunk

@dataclass
class SearchResult:
    chunk_id: str
    text: str
    score: float
    source_file: str
    page_number: int | None
    section: str | None
    doc_type: str
    chunk_index: int

class VectorStore:
    def __init__(self):
        os.makedirs(settings.CHROMA_DB_PATH, exist_ok=True)
        self.client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
        self.collection = self.client.get_or_create_collection("due_diligence_documents")

    def add_chunks(self, chunks: list[DocumentChunk], embeddings: list[list[float]]):
        if not chunks:
            return
            
        ids = [chunk.id for chunk in chunks]
        documents = [chunk.text for chunk in chunks]
        metadatas = []
        for chunk in chunks:
            # Extract doc_id from chunk.id (format: doc_id_chunk_idx)
            doc_id = chunk.id.rsplit('_', 1)[0]
            meta = {
                "doc_id": doc_id,
                "source_file": chunk.source_file,
                "doc_type": chunk.doc_type,
                "chunk_index": chunk.chunk_index
            }
            if chunk.page_number is not None:
                meta["page_number"] = chunk.page_number
            if chunk.section is not None:
                meta["section"] = chunk.section
            metadatas.append(meta)
            
        self.collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )

    def search(self, query_embedding: list[float], n_results: int, filter_doc_ids: list[str] | None = None) -> list[SearchResult]:
        if not self.collection.count():
            return []
            
        where = None
        if filter_doc_ids:
            if len(filter_doc_ids) == 1:
                where = {"doc_id": filter_doc_ids[0]}
            else:
                where = {"doc_id": {"$in": filter_doc_ids}}
                
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=where,
            include=["documents", "metadatas", "distances"]
        )
        
        search_results = []
        if results["ids"] and results["ids"][0]:
            for i in range(len(results["ids"][0])):
                chunk_id = results["ids"][0][i]
                text = results["documents"][0][i]
                meta = results["metadatas"][0][i]
                dist = results["distances"][0][i]
                
                # Convert L2/cosine distance to a similarity score
                score = 1.0 / (1.0 + dist)
                
                search_results.append(SearchResult(
                    chunk_id=chunk_id,
                    text=text,
                    score=score,
                    source_file=meta.get("source_file", ""),
                    page_number=meta.get("page_number"),
                    section=meta.get("section"),
                    doc_type=meta.get("doc_type", ""),
                    chunk_index=meta.get("chunk_index", 0)
                ))
        return search_results

    def delete_document(self, doc_id: str):
        self.collection.delete(where={"doc_id": doc_id})
        
    def get_all_chunks(self) -> list[DocumentChunk]:
        """Fetch all chunks from Chroma to rebuild BM25 index on startup."""
        if not self.collection.count():
            return []
        # get() fetches all by default
        results = self.collection.get(include=["documents", "metadatas"])
        chunks = []
        for i in range(len(results["ids"])):
            meta = results["metadatas"][i]
            chunks.append(DocumentChunk(
                id=results["ids"][i],
                text=results["documents"][i],
                source_file=meta.get("source_file", ""),
                page_number=meta.get("page_number"),
                section=meta.get("section"),
                doc_type=meta.get("doc_type", ""),
                chunk_index=meta.get("chunk_index", 0)
            ))
        return chunks
