import json
import logging
from typing import Dict, Any, Optional
import instructor
from openai import AsyncOpenAI
from packages.config.settings import get_settings
from services.hermes.proposal_builder import TradeProposal

logger = logging.getLogger(__name__)

class ReasoningEngine:
    def __init__(self):
        self.settings = get_settings()
        self.client = instructor.from_openai(
            AsyncOpenAI(
                api_key=self.settings.llm.api_key,
                base_url=self.settings.llm.base_url
            )
        )
        self.model = self.settings.llm.model_routing.get("reasoning", "gpt-4o")

    async def evaluate(self, context: Dict[str, Any]) -> Optional[TradeProposal]:
        system_prompt = f"""You are Hermes, the main trading agent.
Your primary directive is to evaluate market opportunities according to the Trader Constitution.
Constitution:
{context.get('constitution')}

Output exactly the TradeProposal schema. If there is no trade opportunity, return 'neutral' for direction and explain why in the evidence.
"""
        
        user_prompt = f"""Symbol: {context.get('symbol')}
Timeframe: {context.get('timeframe')}
Market Candles: {json.dumps(context.get('market_candles'))}
Indicators: {json.dumps(context.get('indicators'))}
Active Positions: {json.dumps(context.get('positions'))}

Evaluate the data and generate a trade proposal.
Deep Research Report: {json.dumps(context.get('deep_research_report'))}
"""

        try:
            proposal = await self.client.chat.completions.create(
                model=self.model,
                response_model=TradeProposal,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_retries=3
            )
            return proposal
        except Exception as e:
            logger.error(f"Reasoning engine failed to generate proposal: {e}", exc_info=True)
            return None
