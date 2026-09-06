import logging

import instructor
from openai import AsyncOpenAI
from pydantic import BaseModel

from packages.config.settings import get_settings

logger = logging.getLogger(__name__)


class BearThesis(BaseModel):
    bear_thesis: str


class BearSpecialist:
    def __init__(self, client=None):
        self.settings = get_settings()
        self._client = client
        self.model = self.settings.llm.model_routing.get("reasoning", "gpt-4o")

    @property
    def client(self):
        if self._client is None:
            api_key = self.settings.llm.api_key or "mock-key"
            self._client = instructor.from_openai(
                AsyncOpenAI(api_key=api_key, base_url=self.settings.llm.base_url)
            )
        return self._client

    @client.setter
    def client(self, value):
        self._client = value

    async def argue(self, symbol: str, timeframe: str, context: str, ta_result: str) -> str:
        if self._client is None and not self.settings.llm.api_key:
            logger.warning("No LLM API key configured. Returning fallback BearThesis.")
            return f"Bearish downside risk on {symbol}"

        system_prompt = (
            "You are a perma-bear analyst. Your job is to construct the strongest possible "
            "argument for going short, using the provided context and technical analysis."
        )
        user_prompt = (
            f"Argue short for {symbol} on {timeframe} timeframe.\n"
            f"Context: {context}\n"
            f"Technical Analysis: {ta_result}"
        )

        try:
            result = await self.client.chat.completions.create(
                model=self.model,
                response_model=BearThesis,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_retries=2,
            )
            return result.bear_thesis
        except Exception as e:
            if not self.settings.llm.api_key or self.settings.app.env in ("development", "test"):
                logger.warning(
                    f"BearSpecialist LLM call failed or unconfigured ({e}). Falling back."
                )
                return f"Bearish downside risk on {symbol}"
            raise
