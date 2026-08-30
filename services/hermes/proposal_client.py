import logging
from typing import Dict, Any, Optional
from packages.hermes_tools.client import HermesToolsClient
from packages.config.settings import get_settings
from services.hermes.proposal_builder import TradeProposal

logger = logging.getLogger(__name__)

class ProposalClient:
    def __init__(self):
        self.settings = get_settings()
        self.tools_client = HermesToolsClient(
            base_url=self.settings.hermes.base_url,
            token=self.settings.hermes.service_token
        )

    async def submit(self, proposal: TradeProposal) -> Optional[Dict[str, Any]]:
        if proposal.direction == 'neutral':
            logger.info("Trade proposal direction is neutral. Not submitting to risk engine.")
            return None

        # Convert Decimal to float for JSON serialization
        intent = proposal.model_dump(mode='json')
        
        try:
            decision = self.tools_client.create_trade_proposal(intent)
            decision_status = decision.get("decision", "Unknown")
            logger.info(f"Risk decision for proposal: {decision_status}")
            return decision
        except Exception as e:
            logger.error(f"Failed to submit trade proposal: {e}", exc_info=True)
            return None
