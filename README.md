# AI Due Diligence Copilot

A powerful, production-grade AI intelligence platform designed to analyze complex financial documents (10-K, S-1, pitch decks) and extract actionable insights, risks, and growth signals with strict source-grounding.

## Features

- **Multi-modal Document Ingestion:** Support for PDFs, DOCX, PPTX, and XLSX.
- **Hybrid Retrieval (RAG):** Combines Vector Search (ChromaDB + Gemini Embeddings) with Keyword Search (BM25) using Reciprocal Rank Fusion (RRF).
- **Cross-Encoder Reranking:** Ensures extreme precision using `sentence-transformers`.
- **Source-Grounded AI Analysis:** Utilizes Gemini 2.0 Flash to synthesize Executive Summaries, Risk Assessments, and Growth Signals with explicit, verifiable source citations.
- **Streaming Chat:** Real-time conversational interface to query your document vault.
- **Modern Tech Stack:**
  - Backend: FastAPI, Python 3.12, `uv` package manager, Google GenAI SDK.
  - Frontend: React 18, TypeScript, Tailwind CSS, Zustand, Vite.

## Architecture

1. **Ingestion Pipeline:** Files are uploaded, parsed, chunked via TikToken (cl100k_base), embedded, and stored in ChromaDB and a BM25 pickle index asynchronously.
2. **Analysis Engine:** Pydantic-structured prompts enforce the LLM to output predictable JSON, mapping exact source document citations (page numbers, excerpts) to every claim.
3. **Frontend:** A sleek, responsive dark-mode UI displaying Document Vault, Analysis Tabs, and a Chat interface.

## Quickstart

### Prerequisites
- Docker & Docker Compose
- Gemini API Key

### Running Locally (Docker)

1. Clone the repository.
2. Ensure you have a `.env` file in `backend/` with your API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   CHROMA_DB_PATH=./chroma_db
   UPLOADS_DIR=./uploads
   BM25_INDEX_DIR=./bm25_indexes
   ```
3. From the root directory, export your key to the shell and run Docker Compose:
   ```bash
   export GEMINI_API_KEY=your_key
   docker-compose up --build
   ```
4. Access the frontend at `http://localhost` and the API at `http://localhost:8000/docs`.

### Development (Manual Setup)

**Backend:**
```bash
cd backend
uv venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
uv pip install -r pyproject.toml
cp .env.example .env # (Add your Gemini API key)
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Security & Compliance
- **No API Keys in Git:** `.env` files are explicitly excluded via `.gitignore`.
- **Traceable Intelligence:** Every AI claim includes an exact excerpt and citation label.
- **Fault Tolerance:** FileLock mechanisms protect concurrent document storage writes.

## License
MIT
