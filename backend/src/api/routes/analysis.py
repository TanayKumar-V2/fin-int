from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from src.models.analysis import AnalysisResult
from src.ai.analyzer import DueDiligenceAnalyzer

router = APIRouter(prefix="/api/analysis", tags=["analysis"])
analyzer = DueDiligenceAnalyzer()

# In-memory cache
analysis_cache: dict[tuple, AnalysisResult] = {}

class AnalyzeRequest(BaseModel):
    doc_ids: list[str]

class ChatRequest(BaseModel):
    question: str
    doc_ids: list[str]

@router.post("/run", response_model=AnalysisResult)
async def run_analysis(req: AnalyzeRequest):
    if not req.doc_ids:
        raise HTTPException(status_code=400, detail="No document IDs provided")
        
    cache_key = tuple(sorted(req.doc_ids))
    if cache_key in analysis_cache:
        return analysis_cache[cache_key]
        
    try:
        result = analyzer.analyze_documents(req.doc_ids)
        analysis_cache[cache_key] = result
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/chat")
async def chat_query(req: ChatRequest):
    if not req.doc_ids:
        raise HTTPException(status_code=400, detail="No document IDs provided")
        
    async def event_generator():
        try:
            async for chunk in analyzer.answer_query(req.question, req.doc_ids):
                # SSE format: data: chunk\n\n
                yield f"data: {chunk}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")
