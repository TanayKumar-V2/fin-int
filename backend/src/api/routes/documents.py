from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from typing import List
import uuid
import os
from datetime import datetime, timezone
import aiofiles

from src.models.document import DocumentRecord, DocumentStatus
from src.rag.pipeline import process_document_pipeline, get_db, save_db, vector_store, bm25_manager
from src.config import settings

router = APIRouter(prefix="/api/documents", tags=["documents"])

os.makedirs(settings.UPLOADS_DIR, exist_ok=True)

@router.post("/upload", response_model=DocumentRecord)
async def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing")
        
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx", ".pptx", ".xlsx"]:
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, PPTX, and XLSX files are supported")
        
    doc_id = str(uuid.uuid4())
    file_path = os.path.join(settings.UPLOADS_DIR, f"{doc_id}{ext}")
    
    file_size_bytes = 0
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        file_size_bytes = len(content)
        await out_file.write(content)
        
    if file_size_bytes > 50 * 1024 * 1024:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")
        
    record = DocumentRecord(
        id=doc_id,
        filename=file.filename,
        file_type=ext,
        file_size_kb=round(file_size_bytes / 1024.0, 2),
        status=DocumentStatus.UPLOADING,
        uploaded_at=datetime.now(timezone.utc).isoformat()
    )
    
    db = get_db()
    db[doc_id] = record.model_dump()
    save_db(db)
    
    background_tasks.add_task(process_document_pipeline, doc_id, file_path, file.filename, ext)
    
    return record

@router.get("", response_model=List[DocumentRecord])
async def list_documents():
    db = get_db()
    return [DocumentRecord(**v) for v in db.values()]

@router.get("/{doc_id}", response_model=DocumentRecord)
async def get_document(doc_id: str):
    db = get_db()
    if doc_id not in db:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentRecord(**db[doc_id])

@router.delete("/{doc_id}", status_code=204)
async def delete_document(doc_id: str):
    db = get_db()
    if doc_id not in db:
        raise HTTPException(status_code=404, detail="Document not found")
        
    doc = db[doc_id]
    file_path = os.path.join(settings.UPLOADS_DIR, f"{doc_id}{doc['file_type']}")
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except OSError:
            pass
            
    # Phase 3: remove from vector store
    vector_store.delete_document(doc_id)
    bm25_manager.remove_document(doc_id)
    
    del db[doc_id]
    save_db(db)

@router.get("/{doc_id}/status")
async def get_document_status(doc_id: str):
    db = get_db()
    if doc_id not in db:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = db[doc_id]
    return {
        "id": doc["id"],
        "status": doc["status"],
        "chunk_count": doc.get("chunk_count", 0),
        "error_message": doc.get("error_message")
    }
