import logging

import instructor
from openai import AsyncOpenAI

from packages.config.settings import get_settings
from packages.domain.research import SynthesizedResearchReport

logger = logging.getLogger(__name__)

class SynthesizerSpecialist:
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

    async def synthesize(
        self,
        symbol: str,
        timeframe: str,
        context: str,
        ta_result: str,
        bull_thesis: str,
        bear_thesis: str,
    ) -> SynthesizedResearchReport:
        if self._client is None and not self.settings.llm.api_key:
            logger.warning(
                "No LLM API key configured. Returning fallback SynthesizedResearchReport."
            )
            return SynthesizedResearchReport(
                direction="neutral",
                confidence=0.5,
                catalysts=[],
                risks=["Unconfigured LLM Gateway"],
                summary=f"Synthesizer fallback for {symbol} due to unavailable LLM gateway.",
            )

        system_prompt = (
            "You are a pragmatic, objective portfolio manager. Your job is to synthesize "
            "the technical analysis, bull thesis, and bear thesis to make a final directional "
            "call, with confidence, catalysts, risks, and a concise summary."
        )
        user_prompt = (
            f"Synthesize {symbol} on {timeframe} timeframe.\n"
            f"Context: {context}\n"
            f"Technical Analysis: {ta_result}\n"
            f"Bull Thesis: {bull_thesis}\n"
            f"Bear Thesis: {bear_thesis}"
        )
        
        try:
            return await self.client.chat.completions.create(
                model=self.model,
                response_model=SynthesizedResearchReport,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_retries=2,
            )
        except Exception as e:
            if not self.settings.llm.api_key or self.settings.app.env in ("development", "test"):
                logger.warning(
                    f"SynthesizerSpecialist LLM call failed or unconfigured ({e}). Falling back."
                )
                return SynthesizedResearchReport(
                    direction="neutral",
                    confidence=0.5,
                    catalysts=[],
                    risks=["Unconfigured LLM Gateway"],
                    summary=f"Synthesizer fallback for {symbol} due to unavailable LLM gateway.",
                )
            raise
