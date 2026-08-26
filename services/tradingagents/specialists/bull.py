import logging
from pydantic import BaseModel
import instructor
from openai import AsyncOpenAI
from packages.config.settings import get_settings

logger = logging.getLogger(__name__)

class BullThesis(BaseModel):
    bull_thesis: str

class BullSpecialist:
    def __init__(self):
        self.settings = get_settings()
        self.client = instructor.from_openai(
            AsyncOpenAI(
                api_key=self.settings.llm.api_key,
                base_url=self.settings.llm.base_url
            )
        )
        self.model = self.settings.llm.model_routing.get("reasoning", "gpt-4o")

    async def argue(self, symbol: str, timeframe: str, context: str, ta_result: str) -> str:
        system_prompt = "You are a perma-bull analyst. Your job is to construct the strongest possible argument for going long, using the provided context and technical analysis."
        user_prompt = f"Argue long for {symbol} on {timeframe} timeframe.\nContext: {context}\nTechnical Analysis: {ta_result}"
        
        result = await self.client.chat.completions.create(
            model=self.model,
            response_model=BullThesis,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_retries=2
        )
        return result.bull_thesis
