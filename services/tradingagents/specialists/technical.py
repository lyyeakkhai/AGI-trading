import logging

import instructor
from openai import AsyncOpenAI
from pydantic import BaseModel

from packages.config.settings import get_settings

logger = logging.getLogger(__name__)

class TechnicalAnalysisResult(BaseModel):
    trend: str
    key_levels: list[str]
    signals: list[str]

class TechnicalSpecialist:
    def __init__(self, client=None):
        self.settings = get_settings()
        self._client = client
        self.model = self.settings.llm.model_routing.get("reasoning", "gpt-4o")

    @property
    def client(self):
        if self._client is None:
            api_key = self.settings.llm.api_key or "mock-key"
            self._client = instructor.from_openai(
                AsyncOpenAI(
                    api_key=api_key,
                    base_url=self.settings.llm.base_url
                )
            )
        return self._client

    @client.setter
    def client(self, value):
        self._client = value

    async def analyze(self, symbol: str, timeframe: str, context: str) -> TechnicalAnalysisResult:
        if self._client is None and not self.settings.llm.api_key:
            logger.warning(
                "No LLM API key configured. Returning fallback TechnicalAnalysisResult."
            )
            return TechnicalAnalysisResult(
                trend="neutral",
                key_levels=[],
                signals=["Fallback: LLM not configured"],
            )

        system_prompt = (
            "You are a senior technical analyst. "
            "Focus only on price action, volume, trend lines, and momentum indicators."
        )
        user_prompt = f"Analyze {symbol} on {timeframe} timeframe.\nContext: {context}"
        
        try:
            return await self.client.chat.completions.create(
                model=self.model,
                response_model=TechnicalAnalysisResult,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_retries=2,
            )
        except Exception as e:
            if not self.settings.llm.api_key or self.settings.app.env in ("development", "test"):
                logger.warning(
                    f"TechnicalSpecialist LLM call failed or unconfigured ({e}). "
                    "Falling back to neutral result."
                )
                return TechnicalAnalysisResult(
                    trend="neutral",
                    key_levels=[],
                    signals=["Fallback: LLM not configured"],
                )
            raise
