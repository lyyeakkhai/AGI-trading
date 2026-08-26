import logging
from typing import Dict, Any, Optional
from openai import AsyncOpenAI
from packages.config.settings import get_settings
from packages.hermes_tools.client import HermesToolsClient
from services.hermes.proposal_builder import TradeProposal

logger = logging.getLogger(__name__)

class MemoryRecorder:
    def __init__(self):
        self.settings = get_settings()
        self.tools_client = HermesToolsClient(
            base_url=self.settings.hermes.base_url,
            token=self.settings.hermes.service_token
        )
        self.llm_client = AsyncOpenAI(
            api_key=self.settings.llm.api_key,
            base_url=self.settings.llm.base_url
        )
        self.model = self.settings.llm.model_routing.get("fast", "gpt-4o-mini")

    async def _generate_reflection(self, context: Dict[str, Any], proposal: TradeProposal, decision: Optional[Dict[str, Any]]) -> str:
        prompt = f"""You are Hermes, generating an episodic memory reflection.
Symbol: {context.get('symbol')}
Timeframe: {context.get('timeframe')}
Proposal: {proposal.model_dump_json()}
Risk Decision: {decision}

Provide a brief, concise reflection (1-2 paragraphs) on why this decision was made and what we can learn from it for future trades.
"""
        try:
            response = await self.llm_client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
            )
            return response.choices[0].message.content or "No reflection generated."
        except Exception as e:
            logger.error(f"Failed to generate reflection: {e}")
            return f"Failed to generate reflection: {e}"

    async def record(self, context: Dict[str, Any], proposal: TradeProposal, decision: Optional[Dict[str, Any]]):
        reflection = await self._generate_reflection(context, proposal, decision)
        
        observation = {
            "type": "trade_proposal_reflection",
            "symbol": context.get("symbol"),
            "timeframe": context.get("timeframe"),
            "content": reflection,
            "metadata": {
                "direction": proposal.direction,
                "decision": decision.get("decision") if decision else "N/A"
            }
        }
        
        try:
            self.tools_client.store_memory(observation)
            logger.info("Successfully recorded memory reflection.")
        except Exception as e:
            logger.error(f"Failed to store memory: {e}", exc_info=True)
