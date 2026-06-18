import tiktoken
import uuid
from typing import Any
from src.models.document import DocumentChunk
from src.config import settings

enc = tiktoken.get_encoding("cl100k_base")

def get_token_count(text: str) -> int:
    return len(enc.encode(text, disallowed_special=()))

def split_text(text: str, chunk_size: int, chunk_overlap: int) -> list[str]:
    separators = ["\n\n", "\n", ". ", " "]
    
    def _split_text(text: str, seps: list[str]) -> list[str]:
        if not seps:
            tokens = enc.encode(text, disallowed_special=())
            return [enc.decode(tokens[i:i + chunk_size]) for i in range(0, len(tokens), chunk_size)]
            
        sep = seps[0]
        if sep not in text:
            return _split_text(text, seps[1:])
            
        splits = text.split(sep)
        result = []
        for i, s in enumerate(splits):
            part = s + sep if i < len(splits) - 1 else s
            if get_token_count(part) <= chunk_size:
                result.append(part)
            else:
                result.extend(_split_text(part, seps[1:]))
        return result

    raw_splits = _split_text(text, separators)
    
    chunks = []
    current_chunk = ""
    
    for split in raw_splits:
        if get_token_count(current_chunk + split) <= chunk_size:
            current_chunk += split
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            
            # Start new chunk with overlap
            if current_chunk:
                tokens = enc.encode(current_chunk, disallowed_special=())
                overlap_tokens = tokens[-chunk_overlap:] if len(tokens) > chunk_overlap else tokens
                current_chunk = enc.decode(overlap_tokens) + split
            else:
                current_chunk = split
                
    if current_chunk:
        chunks.append(current_chunk.strip())
        
    return [c for c in chunks if c]

def chunk_document(
    doc_id: str, 
    source_file: str, 
    doc_type: str, 
    blocks: list[dict[str, Any]]
) -> list[DocumentChunk]:
    chunks = []
    chunk_idx = 0
    
    for block in blocks:
        text = block.get("text", "")
        if not text:
            continue
            
        page = block.get("page_number")
        section = block.get("section")
        
        split_texts = split_text(text, settings.CHUNK_SIZE, settings.CHUNK_OVERLAP)
        
        for st in split_texts:
            chunks.append(DocumentChunk(
                id=f"{doc_id}_{chunk_idx}",
                text=st,
                source_file=source_file,
                page_number=page,
                section=section,
                doc_type=doc_type,
                chunk_index=chunk_idx
            ))
            chunk_idx += 1
            
    return chunks
