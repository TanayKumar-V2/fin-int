from google import genai
from google.genai import types
from pydantic import BaseModel
from typing import AsyncGenerator
import json
import logging
from src.config import settings

logger = logging.getLogger(__name__)

class GeminiClient:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = settings.GEMINI_MODEL

    def generate(self, prompt: str, system: str, temperature: float = 0.1) -> str:
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system,
                    temperature=temperature,
                )
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini generate error: {e}")
            raise

    def generate_structured(self, prompt: str, system: str, response_schema: type[BaseModel], temperature: float = 0.1) -> BaseModel:
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system,
                    temperature=temperature,
                    response_mime_type="application/json",
                    response_schema=response_schema,
                )
            )
            data = json.loads(response.text)
            return response_schema(**data)
        except Exception as e:
            logger.error(f"Gemini generate_structured error: {e}")
            raise

    async def stream(self, prompt: str, system: str, temperature: float = 0.1) -> AsyncGenerator[str, None]:
        try:
            # We can use the async version of the google-genai client
            async_client = genai.Client(api_key=settings.GEMINI_API_KEY, http_options={'api_version': 'v1alpha'})
            response_stream = await async_client.aio.models.generate_content_stream(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system,
                    temperature=temperature,
                )
            )
            async for chunk in response_stream:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            logger.error(f"Gemini stream error: {e}")
            raise
