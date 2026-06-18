import time
import logging
from google import genai
from google.genai import types
from src.config import settings

logger = logging.getLogger(__name__)

# Initialize GenAI client
client = genai.Client(api_key=settings.GEMINI_API_KEY)

def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed document chunks with RETRIEVAL_DOCUMENT task type. Batches of 100."""
    embeddings = []
    batch_size = 100
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        retries = 3
        while retries > 0:
            try:
                response = client.models.embed_content(
                    model=settings.GEMINI_EMBEDDING_MODEL,
                    contents=batch,
                    config=types.EmbedContentConfig(
                        task_type="RETRIEVAL_DOCUMENT",
                    )
                )
                embeddings.extend([emb.values for emb in response.embeddings])
                break
            except Exception as e:
                retries -= 1
                logger.warning(f"Embedding batch failed, retries left {retries}. Error: {e}")
                if retries == 0:
                    raise
                time.sleep(2 ** (3 - retries))
    return embeddings

def embed_query(query: str) -> list[float]:
    """Embed search query with RETRIEVAL_QUERY task type."""
    response = client.models.embed_content(
        model=settings.GEMINI_EMBEDDING_MODEL,
        contents=query,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_QUERY",
        )
    )
    return response.embeddings[0].values
