import logging
from pydantic import BaseModel
import instructor
from openai import AsyncOpenAI
from packages.config.settings import get_settings

logger = logging.getLogger(__name__)

class TechnicalAnalysisResult(BaseModel):
    trend: str
    key_levels: list[str]
    signals: list[str]

class TechnicalSpecialist:
    def __init__(self):
        self.settings = get_settings()
        self.client = instructor.from_openai(
            AsyncOpenAI(
                api_key=self.settings.llm.api_key,
                base_url=self.settings.llm.base_url
            )
        )
        self.model = self.settings.llm.model_routing.get("reasoning", "gpt-4o")

    async def analyze(self, symbol: str, timeframe: str, context: str) -> TechnicalAnalysisResult:
        system_prompt = "You are a senior technical analyst. Focus only on price action, volume, trend lines, and momentum indicators."
        user_prompt = f"Analyze {symbol} on {timeframe} timeframe.\nContext: {context}"
        
        return await self.client.chat.completions.create(
            model=self.model,
            response_model=TechnicalAnalysisResult,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_retries=2
        )
