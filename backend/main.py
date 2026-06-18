from fastapi import FastAPI
from src.api.middleware import setup_middleware
from src.api.routes import health, documents, analysis

app = FastAPI(
    title="DueDiligenceAI API",
    version="1.0.0",
    description="Backend API for AI Due Diligence Copilot"
)

# Set up middleware
setup_middleware(app)

# Include routers
app.include_router(health.router)
app.include_router(documents.router)
app.include_router(analysis.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
