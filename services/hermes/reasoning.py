import json
import logging
from decimal import Decimal
from typing import Any

import instructor
from openai import AsyncOpenAI

from packages.config.settings import get_settings
from services.hermes.proposal_builder import TradeProposal

logger = logging.getLogger(__name__)


class ReasoningEngine:
    def __init__(self, client: Any | None = None):
        self.settings = get_settings()
        self._client = client
        self.model = self.settings.llm.model_routing.get("reasoning", "gpt-4o")

    @property
    def client(self) -> Any:
        if self._client is None:
            key = self.settings.llm.api_key or "mock-key"
            self._client = instructor.from_openai(
                AsyncOpenAI(
                    api_key=key,
                    base_url=self.settings.llm.base_url,
                )
            )
        return self._client

    async def evaluate(self, context: dict[str, Any]) -> TradeProposal | None:
        system_prompt = f"""You are Hermes, the main trading agent.
Your primary directive is to evaluate market opportunities according to the Trader Constitution.
Constitution:
{context.get("constitution")}

Output exactly the TradeProposal schema. If there is no trade opportunity,
return 'neutral' for direction and explain why in the evidence.
"""

        user_prompt = f"""Symbol: {context.get("symbol")}
Timeframe: {context.get("timeframe")}
Market Candles: {json.dumps(context.get("market_candles"))}
Indicators: {json.dumps(context.get("indicators"))}
Active Positions: {json.dumps(context.get("positions"))}

Evaluate the data and generate a trade proposal.
Deep Research Report: {json.dumps(context.get("deep_research_report"))}
"""

        try:
            proposal = await self.client.chat.completions.create(
                model=self.model,
                response_model=TradeProposal,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_retries=3,
            )
            if proposal is not None:
                if not proposal.symbol:
                    proposal.symbol = context.get("symbol")
                if not proposal.quantity or proposal.quantity <= Decimal("0"):
                    proposal.quantity = Decimal("0.01")
            return proposal
        except Exception as e:
            logger.error(f"Reasoning engine failed to generate proposal: {e}", exc_info=True)
            return None
