import logging
import instructor
from openai import AsyncOpenAI
from packages.config.settings import get_settings
from packages.domain.research import SynthesizedResearchReport

logger = logging.getLogger(__name__)

class SynthesizerSpecialist:
    def __init__(self):
        self.settings = get_settings()
        self.client = instructor.from_openai(
            AsyncOpenAI(
                api_key=self.settings.llm.api_key,
                base_url=self.settings.llm.base_url
            )
        )
        self.model = self.settings.llm.model_routing.get("reasoning", "gpt-4o")

    async def synthesize(self, symbol: str, timeframe: str, context: str, ta_result: str, bull_thesis: str, bear_thesis: str) -> SynthesizedResearchReport:
        system_prompt = "You are a pragmatic, objective portfolio manager. Your job is to synthesize the technical analysis, bull thesis, and bear thesis to make a final directional call, with confidence, catalysts, risks, and a concise summary."
        user_prompt = f"Synthesize {symbol} on {timeframe} timeframe.\nContext: {context}\nTechnical Analysis: {ta_result}\nBull Thesis: {bull_thesis}\nBear Thesis: {bear_thesis}"
        
        return await self.client.chat.completions.create(
            model=self.model,
            response_model=SynthesizedResearchReport,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_retries=2
        )
