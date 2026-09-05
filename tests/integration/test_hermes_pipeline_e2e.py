from decimal import Decimal
from unittest.mock import AsyncMock, patch

import pytest

from services.hermes.orchestrator import HermesOrchestrator
from services.hermes.proposal_builder import TradeProposal


@pytest.fixture(autouse=True)
def mock_openai_env(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "mock-key")


@pytest.mark.asyncio
async def test_full_hermes_pipeline_flow():
    orch = HermesOrchestrator()
    event_data = {
        b"symbol": b"BTC/USDT",
        b"timeframe": b"1h",
        b"signal_type": b"BULLISH_BREAKOUT",
        b"confidence": b"0.45",  # Low confidence to test escalation
    }

    with (
        patch.object(orch.context_assembler, "assemble", new_callable=AsyncMock) as mock_ctx,
        patch.object(orch.reasoning, "evaluate", new_callable=AsyncMock) as mock_reason,
        patch.object(
            orch.research_client, "trigger_deep_research", new_callable=AsyncMock
        ) as mock_research,
        patch.object(orch.proposal_client, "submit", new_callable=AsyncMock) as mock_submit,
        patch.object(orch.memory, "record", new_callable=AsyncMock) as mock_mem,
    ):
        mock_ctx.return_value = {"symbol": "BTC/USDT", "timeframe": "1h", "indicators": {}}
        proposal = TradeProposal(
            direction="long",
            confidence=0.5,
            entry=Decimal("50000"),
            stop_loss=Decimal("49000"),
            take_profit=Decimal("52000"),
            supporting_evidence=["Breakout"],
            contradicting_evidence=[],
            invalidation_rules=["Below 49000"],
        )
        mock_reason.return_value = proposal
        mock_research.return_value = {"direction": "long", "confidence": 0.8}
        mock_submit.return_value = {"decision": "Approved", "proposal_id": "prop_test_123"}

        await orch.process_opportunity(event_data)

        mock_ctx.assert_called_once_with("BTC/USDT", "1h")
        # Should escalate because confidence 0.5 < 0.6
        mock_research.assert_called_once()
        mock_submit.assert_called_once()
        mock_mem.assert_called_once()


@pytest.mark.asyncio
async def test_hermes_pipeline_high_confidence_no_escalation():
    orch = HermesOrchestrator()
    event_data = {
        b"symbol": b"ETH/USDT",
        b"timeframe": b"15m",
        b"signal_type": b"TREND_CONTINUATION",
        b"confidence": b"0.85",
    }

    with (
        patch.object(orch.context_assembler, "assemble", new_callable=AsyncMock) as mock_ctx,
        patch.object(orch.reasoning, "evaluate", new_callable=AsyncMock) as mock_reason,
        patch.object(
            orch.research_client, "trigger_deep_research", new_callable=AsyncMock
        ) as mock_research,
        patch.object(orch.proposal_client, "submit", new_callable=AsyncMock) as mock_submit,
        patch.object(orch.memory, "record", new_callable=AsyncMock) as mock_mem,
    ):
        mock_ctx.return_value = {
            "symbol": "ETH/USDT",
            "timeframe": "15m",
            "indicators": {"rsi": 62},
        }
        high_conf_proposal = TradeProposal(
            direction="long",
            confidence=0.85,
            entry=Decimal("3000"),
            stop_loss=Decimal("2950"),
            take_profit=Decimal("3100"),
            supporting_evidence=["Strong uptrend", "High volume"],
            contradicting_evidence=[],
            invalidation_rules=["Break below 2950"],
        )
        mock_reason.return_value = high_conf_proposal
        mock_submit.return_value = {"decision": "Approved", "proposal_id": "prop_test_456"}

        await orch.process_opportunity(event_data)

        mock_ctx.assert_called_once_with("ETH/USDT", "15m")
        # Should NOT escalate because confidence 0.85 >= 0.6 and not volatile
        mock_research.assert_not_called()
        mock_reason.assert_called_once()
        mock_submit.assert_called_once_with(high_conf_proposal)
        mock_mem.assert_called_once()
