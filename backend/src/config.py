from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    CHROMA_DB_PATH: str = "./chroma_db"
    UPLOADS_DIR: str = "./uploads"
    BM25_INDEX_DIR: str = "./bm25_indexes"
    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 150
    MAX_RETRIEVAL_RESULTS: int = 8
    GEMINI_MODEL: str = "gemini-2.0-flash"
    GEMINI_EMBEDDING_MODEL: str = "text-embedding-004"
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
