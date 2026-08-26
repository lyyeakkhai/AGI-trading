import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from decimal import Decimal

from services.hermes.orchestrator import HermesOrchestrator
from services.hermes.proposal_builder import TradeProposal

@pytest.fixture
def mock_settings(mocker):
    settings_mock = mocker.patch("packages.config.settings.get_settings")
    settings_mock.return_value.redis.key_prefix = "test:"
    return settings_mock

@pytest.fixture
def orchestrator(mock_settings, mocker):
    with patch("services.hermes.orchestrator.redis.from_url") as mock_redis, \
         patch("services.hermes.orchestrator.ContextAssembler") as mock_ctx, \
         patch("services.hermes.orchestrator.ReasoningEngine") as mock_reasoning, \
         patch("services.hermes.orchestrator.ProposalClient") as mock_prop, \
         patch("services.hermes.orchestrator.MemoryRecorder") as mock_mem:
        
        o = HermesOrchestrator()
        o.redis = mock_redis.return_value
        o.context_assembler = mock_ctx.return_value
        o.reasoning = mock_reasoning.return_value
        o.proposal_client = mock_prop.return_value
        o.memory = mock_mem.return_value
        return o

@pytest.mark.asyncio
async def test_process_opportunity_valid_proposal(orchestrator):
    event_data = {b"symbol": b"BTC/USDT", b"timeframe": b"1h"}
    
    # Mock context
    orchestrator.context_assembler.assemble.return_value = {"symbol": "BTC/USDT"}
    
    # Mock LLM reasoning
    proposal = TradeProposal(
        direction="long",
        entry=Decimal("50000"),
        stop_loss=Decimal("49000"),
        take_profit=Decimal("52000"),
        supporting_evidence=["Bullish engulfing"],
        contradicting_evidence=["Low volume"],
        invalidation_rules=["Close below 48000"]
    )
    orchestrator.reasoning.evaluate.return_value = proposal
    
    # Mock proposal submission
    orchestrator.proposal_client.submit.return_value = {"decision": "Approved"}
    
    await orchestrator.process_opportunity(event_data)
    
    orchestrator.context_assembler.assemble.assert_called_once_with("BTC/USDT", "1h")
    orchestrator.reasoning.evaluate.assert_called_once_with({"symbol": "BTC/USDT"})
    orchestrator.proposal_client.submit.assert_called_once_with(proposal)
    orchestrator.memory.record.assert_called_once_with({"symbol": "BTC/USDT"}, proposal, {"decision": "Approved"})

@pytest.mark.asyncio
async def test_process_opportunity_missing_symbol(orchestrator):
    event_data = {b"timeframe": b"1h"}
    await orchestrator.process_opportunity(event_data)
    orchestrator.context_assembler.assemble.assert_not_called()

@pytest.mark.asyncio
async def test_process_opportunity_invalid_json_reasoning_failure(orchestrator):
    event_data = {b"symbol": b"BTC/USDT", b"timeframe": b"1h"}
    orchestrator.context_assembler.assemble.return_value = {"symbol": "BTC/USDT"}
    orchestrator.reasoning.evaluate.return_value = None # Simulating validation error / retry failure
    
    await orchestrator.process_opportunity(event_data)
    
    orchestrator.proposal_client.submit.assert_not_called()
    orchestrator.memory.record.assert_not_called()

@pytest.mark.asyncio
async def test_process_opportunity_api_error_on_submit(orchestrator):
    event_data = {b"symbol": b"BTC/USDT", b"timeframe": b"1h"}
    orchestrator.context_assembler.assemble.return_value = {"symbol": "BTC/USDT"}
    
    proposal = TradeProposal(
        direction="short",
        supporting_evidence=["a"], contradicting_evidence=["b"], invalidation_rules=["c"]
    )
    orchestrator.reasoning.evaluate.return_value = proposal
    
    # Client raises exception or returns None on API error
    orchestrator.proposal_client.submit.side_effect = Exception("API Down")
    
    await orchestrator.process_opportunity(event_data)
    
    # The error should be caught and logged, orchestrator shouldn't crash
    # Memory record wouldn't be called because submit raised Exception, wait, in orchestrator it's not wrapped in separate try-except, it will fall to the outer except.
    orchestrator.memory.record.assert_not_called()
