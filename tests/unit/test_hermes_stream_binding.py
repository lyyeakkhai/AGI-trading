from unittest.mock import AsyncMock, patch

import pytest

from packages.events.streams import StreamNames
from services.hermes.orchestrator import HermesOrchestrator


@pytest.fixture(autouse=True)
def mock_openai_env(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "mock-key")


def test_hermes_stream_name_matches_scanner():
    orch = HermesOrchestrator()
    # Must listen to the exact same stream that OpportunityScanner publishes to
    assert orch.stream_name.endswith(StreamNames.OPPORTUNITIES)


@pytest.mark.asyncio
async def test_process_opportunity_handles_str_and_bytes_keys():
    with (
        patch("services.hermes.orchestrator.redis.from_url"),
        patch("services.hermes.orchestrator.ContextAssembler"),
        patch("services.hermes.orchestrator.ReasoningEngine"),
        patch("services.hermes.orchestrator.ProposalClient"),
        patch("services.hermes.orchestrator.MemoryRecorder"),
    ):
        orch = HermesOrchestrator()
        orch.context_assembler.assemble = AsyncMock(return_value={"symbol": "BTC/USDT"})
        orch.reasoning.evaluate = AsyncMock(return_value=None)

        # Test with bytes keys and values
        await orch.process_opportunity({b"symbol": b"BTC/USDT", b"timeframe": b"1h"})
        orch.context_assembler.assemble.assert_called_with("BTC/USDT", "1h")

        orch.context_assembler.assemble.reset_mock()

        # Test with str keys and values
        await orch.process_opportunity({"symbol": "ETH/USDT", "timeframe": "15m"})
        orch.context_assembler.assemble.assert_called_with("ETH/USDT", "15m")

        orch.context_assembler.assemble.reset_mock()

        # Test with mixed str/bytes keys and values
        await orch.process_opportunity({"symbol": b"SOL/USDT", b"timeframe": "4h"})
        orch.context_assembler.assemble.assert_called_with("SOL/USDT", "4h")
