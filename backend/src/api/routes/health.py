from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint for the API."""
    return {"status": "ok", "version": "1.0.0"}
