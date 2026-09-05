import logging
from typing import Any

from packages.config.settings import get_settings
from packages.hermes_tools.client import HermesToolsClient
from services.hermes.proposal_builder import TradeProposal

logger = logging.getLogger(__name__)


class ProposalClient:
    def __init__(self, tools_client: HermesToolsClient | None = None):
        self.settings = get_settings()
        self._tools_client = tools_client

    @property
    def tools_client(self) -> HermesToolsClient:
        if self._tools_client is None:
            self._tools_client = HermesToolsClient(
                base_url=self.settings.hermes.base_url,
                token=self.settings.hermes.service_token,
            )
        return self._tools_client

    async def submit(self, proposal: TradeProposal) -> dict[str, Any] | None:
        if proposal.direction == "neutral":
            logger.info("Trade proposal direction is neutral. Not submitting to risk engine.")
            return None

        # Convert Decimal to float for JSON serialization
        intent = proposal.model_dump(mode="json")
        if not intent.get("symbol"):
            intent["symbol"] = proposal.symbol or "BTC/USDT"
        if not intent.get("quantity"):
            intent["quantity"] = str(proposal.quantity or "0.01")

        try:
            decision = self.tools_client.create_trade_proposal(intent)
            decision_status = decision.get("decision", "Unknown")
            logger.info(f"Risk decision for proposal: {decision_status}")
            return decision
        except Exception as e:
            logger.error(f"Failed to submit trade proposal: {e}", exc_info=True)
            return None
