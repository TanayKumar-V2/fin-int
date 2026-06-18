from pydantic import BaseModel, Field
from enum import Enum
from typing import Any
from datetime import datetime

class DocumentStatus(str, Enum):
    UPLOADING = "uploading"
    INDEXING = "indexing"
    READY = "ready"
    ERROR = "error"

class DocumentChunk(BaseModel):
    id: str
    text: str
    source_file: str
    page_number: int | None = None
    section: str | None = None
    doc_type: str
    chunk_index: int
    metadata: dict[str, Any] = Field(default_factory=dict)

    def citation(self) -> str:
        parts = [self.source_file]
        if self.page_number is not None:
            parts.append(f"p.{self.page_number}")
        if self.section:
            parts.append(f"§ {self.section}")
        return " · ".join(parts)

class DocumentRecord(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size_kb: float
    status: DocumentStatus
    chunk_count: int = 0
    uploaded_at: str
    error_message: str | None = None
