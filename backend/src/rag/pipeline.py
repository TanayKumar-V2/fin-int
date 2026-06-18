import os
import json
import time
import filelock
import traceback
from src.models.document import DocumentStatus
from src.config import settings
from src.rag.document_parser import parse_document
from src.rag.chunker import chunk_document
from src.rag.embedder import embed_texts
from src.rag.vector_store import VectorStore
from src.rag.bm25_index import BM25IndexManager

DB_PATH = os.path.join(settings.UPLOADS_DIR, "documents.json")
LOCK_PATH = DB_PATH + ".lock"

vector_store = VectorStore()
bm25_manager = BM25IndexManager()

# Rebuild BM25 if empty
if not bm25_manager.chunks:
    all_chunks = vector_store.get_all_chunks()
    if all_chunks:
        bm25_manager.build_index(all_chunks)

def get_db() -> dict:
    if not os.path.exists(DB_PATH):
        return {}
    with filelock.FileLock(LOCK_PATH):
        with open(DB_PATH, "r") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return {}

def save_db(data: dict):
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with filelock.FileLock(LOCK_PATH):
        with open(DB_PATH, "w") as f:
            json.dump(data, f, indent=2)

def update_document_status(doc_id: str, status: DocumentStatus, chunk_count: int = 0, error_message: str | None = None):
    db = get_db()
    if doc_id in db:
        db[doc_id]["status"] = status
        db[doc_id]["chunk_count"] = chunk_count
        db[doc_id]["error_message"] = error_message
        save_db(db)

def process_document_pipeline(doc_id: str, file_path: str, filename: str, file_type: str):
    """Background ingestion task."""
    try:
        update_document_status(doc_id, DocumentStatus.INDEXING)
        
        # 1. Parse
        blocks = parse_document(file_path, file_type)
        
        # 2. Chunk
        chunks = chunk_document(doc_id, filename, file_type, blocks)
        
        if chunks:
            # 3. Embed
            texts = [c.text for c in chunks]
            embeddings = embed_texts(texts)
            
            # 4. Store in Chroma
            vector_store.add_chunks(chunks, embeddings)
            
            # 5. Update BM25
            bm25_manager.add_chunks(chunks)
        
        update_document_status(doc_id, DocumentStatus.READY, chunk_count=len(chunks))
        
    except Exception as e:
        traceback.print_exc()
        update_document_status(doc_id, DocumentStatus.ERROR, error_message=str(e))
