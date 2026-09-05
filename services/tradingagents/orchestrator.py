import asyncio
import logging

from packages.domain.research import SynthesizedResearchReport
from services.tradingagents.specialists.bear import BearSpecialist
from services.tradingagents.specialists.bull import BullSpecialist
from services.tradingagents.specialists.synthesizer import SynthesizerSpecialist
from services.tradingagents.specialists.technical import TechnicalSpecialist

logger = logging.getLogger(__name__)

class DebateOrchestrator:
    def __init__(
        self,
        technical: TechnicalSpecialist | None = None,
        bull: BullSpecialist | None = None,
        bear: BearSpecialist | None = None,
        synthesizer: SynthesizerSpecialist | None = None,
    ):
        self.technical = technical or TechnicalSpecialist()
        self.bull = bull or BullSpecialist()
        self.bear = bear or BearSpecialist()
        self.synthesizer = synthesizer or SynthesizerSpecialist()

    async def run_deep_research(
        self, symbol: str, timeframe: str, context: str
    ) -> SynthesizedResearchReport:
        logger.info(f"Starting deep research for {symbol} on {timeframe}")
        
        # 1. Technical Analysis
        ta_result_obj = await self.technical.analyze(symbol, timeframe, context)
        ta_result_str = (
            f"Trend: {ta_result_obj.trend}\n"
            f"Key Levels: {ta_result_obj.key_levels}\n"
            f"Signals: {ta_result_obj.signals}"
        )
        
        # 2. Bull and Bear Concurrent
        bull_task = asyncio.create_task(self.bull.argue(symbol, timeframe, context, ta_result_str))
        bear_task = asyncio.create_task(self.bear.argue(symbol, timeframe, context, ta_result_str))
        
        bull_thesis, bear_thesis = await asyncio.gather(bull_task, bear_task)
        
        # 3. Synthesize
        report = await self.synthesizer.synthesize(
            symbol, timeframe, context, ta_result_str, bull_thesis, bear_thesis
        )
        
        logger.info(f"Deep research completed for {symbol}")
        return report
