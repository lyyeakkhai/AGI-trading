import asyncio
import time
from unittest.mock import AsyncMock

import pytest

from packages.domain.research import SynthesizedResearchReport
from services.tradingagents.orchestrator import DebateOrchestrator
from services.tradingagents.specialists.bear import BearSpecialist
from services.tradingagents.specialists.bull import BullSpecialist
from services.tradingagents.specialists.synthesizer import SynthesizerSpecialist
from services.tradingagents.specialists.technical import (
    TechnicalAnalysisResult,
    TechnicalSpecialist,
)


@pytest.mark.asyncio
async def test_debate_orchestrator_runs_concurrently():
    orchestrator = DebateOrchestrator()

    # Mock specialists
    orchestrator.technical.analyze = AsyncMock(
        return_value=TechnicalAnalysisResult(
            trend="bullish", key_levels=["50000"], signals=["RSI oversold"]
        )
    )
    orchestrator.bull.argue = AsyncMock(return_value="Strong upside target")
    orchestrator.bear.argue = AsyncMock(return_value="Resistance at 52000")
    orchestrator.synthesizer.synthesize = AsyncMock(
        return_value=SynthesizedResearchReport(
            direction="long",
            confidence=0.75,
            catalysts=["Breakout"],
            risks=["Drawdown"],
            summary="Buy setup",
        )
    )

    report = await orchestrator.run_deep_research("BTC/USDT", "1h", "Test context")
    assert report.direction == "long"
    assert report.confidence == 0.75
    orchestrator.bull.argue.assert_called_once()
    orchestrator.bear.argue.assert_called_once()


@pytest.mark.asyncio
async def test_debate_orchestrator_concurrency_timing():
    orchestrator = DebateOrchestrator()

    orchestrator.technical.analyze = AsyncMock(
        return_value=TechnicalAnalysisResult(
            trend="neutral", key_levels=["60000"], signals=["MACD flat"]
        )
    )

    async def delayed_bull(*args, **kwargs):
        await asyncio.sleep(0.05)
        return "Bull thesis"

    async def delayed_bear(*args, **kwargs):
        await asyncio.sleep(0.05)
        return "Bear thesis"

    orchestrator.bull.argue = AsyncMock(side_effect=delayed_bull)
    orchestrator.bear.argue = AsyncMock(side_effect=delayed_bear)
    orchestrator.synthesizer.synthesize = AsyncMock(
        return_value=SynthesizedResearchReport(
            direction="neutral", confidence=0.5, catalysts=[], risks=[], summary="Neutral"
        )
    )

    start = time.perf_counter()
    report = await orchestrator.run_deep_research("BTC/USDT", "1h", "Test context")
    elapsed = time.perf_counter() - start

    assert report.direction == "neutral"
    # If run sequentially, would take >= 0.10s. If concurrent, ~0.05s.
    assert elapsed < 0.09, f"Elapsed time {elapsed:.3f}s indicates sequential execution"


@pytest.mark.asyncio
async def test_debate_orchestrator_passes_full_context_to_synthesizer():
    orchestrator = DebateOrchestrator()

    ta_result = TechnicalAnalysisResult(
        trend="bullish", key_levels=["60000", "65000"], signals=["RSI oversold"]
    )
    orchestrator.technical.analyze = AsyncMock(return_value=ta_result)
    orchestrator.bull.argue = AsyncMock(return_value="Bull argument 123")
    orchestrator.bear.argue = AsyncMock(return_value="Bear argument 456")
    orchestrator.synthesizer.synthesize = AsyncMock(
        return_value=SynthesizedResearchReport(
            direction="long",
            confidence=0.8,
            catalysts=["ETF flow"],
            risks=["Macro"],
            summary="Strong long",
        )
    )

    await orchestrator.run_deep_research("ETH/USDT", "4h", "Market breakout imminent")

    orchestrator.technical.analyze.assert_awaited_once_with(
        "ETH/USDT", "4h", "Market breakout imminent"
    )
    expected_ta_str = (
        f"Trend: {ta_result.trend}\n"
        f"Key Levels: {ta_result.key_levels}\n"
        f"Signals: {ta_result.signals}"
    )
    orchestrator.bull.argue.assert_awaited_once_with(
        "ETH/USDT", "4h", "Market breakout imminent", expected_ta_str
    )
    orchestrator.bear.argue.assert_awaited_once_with(
        "ETH/USDT", "4h", "Market breakout imminent", expected_ta_str
    )
    orchestrator.synthesizer.synthesize.assert_awaited_once_with(
        "ETH/USDT",
        "4h",
        "Market breakout imminent",
        expected_ta_str,
        "Bull argument 123",
        "Bear argument 456",
    )


def test_specialists_init_resilience_without_api_key():
    # Instantiating specialists without LLM_GATEWAY_KEY must not raise OpenAIError
    tech = TechnicalSpecialist()
    bull = BullSpecialist()
    bear = BearSpecialist()
    synth = SynthesizerSpecialist()
    orch = DebateOrchestrator()

    assert tech.model == "gpt-4o"
    assert bull.model == "gpt-4o"
    assert bear.model == "gpt-4o"
    assert synth.model == "gpt-4o"
    assert orch.technical is not None
    assert orch.bull is not None
    assert orch.bear is not None
    assert orch.synthesizer is not None


def test_synthesized_research_report_schema_and_compat():
    # Test new schema fields
    report = SynthesizedResearchReport(
        direction="long",
        confidence=0.85,
        catalysts=["Volume surge"],
        risks=["Overbought"],
        summary="Clear uptrend",
    )
    assert report.direction == "long"
    assert report.confidence == 0.85
    assert report.catalysts == ["Volume surge"]
    assert report.risks == ["Overbought"]
    assert report.summary == "Clear uptrend"

    # Test backward compatibility aliases and properties
    assert report.consensus_direction == "long"
    assert report.confidence_score == 0.85
    assert report.key_catalysts == ["Volume surge"]
    assert report.key_risks == ["Overbought"]

    # Test instantiation via legacy alias names
    legacy_report = SynthesizedResearchReport(
        consensus_direction="short",
        confidence_score=0.7,
        key_catalysts=["Breakdown"],
        key_risks=["Reversal"],
        summary="Bearish continuation",
    )
    assert legacy_report.direction == "short"
    assert legacy_report.consensus_direction == "short"
    assert legacy_report.confidence == 0.7
    assert legacy_report.confidence_score == 0.7


@pytest.mark.asyncio
async def test_specialists_unmocked_fallback_without_api_key():
    # Calling unmocked specialists when no LLM key is configured returns safe fallbacks
    orch = DebateOrchestrator()
    report = await orch.run_deep_research("SOL/USDT", "15m", "Test without key")
    assert report.direction == "neutral"
    assert report.confidence == 0.5
    assert "Unconfigured LLM Gateway" in report.risks


def test_debate_orchestrator_dependency_injection():
    tech = TechnicalSpecialist()
    bull = BullSpecialist()
    bear = BearSpecialist()
    synth = SynthesizerSpecialist()

    orch = DebateOrchestrator(technical=tech, bull=bull, bear=bear, synthesizer=synth)
    assert orch.technical is tech
    assert orch.bull is bull
    assert orch.bear is bear
    assert orch.synthesizer is synth


@pytest.mark.asyncio
async def test_specialists_client_injection():
    mock_client = AsyncMock()
    # Mock completion for technical specialist
    mock_client.chat.completions.create.return_value = TechnicalAnalysisResult(
        trend="bullish", key_levels=["100"], signals=["MACD cross"]
    )
    tech = TechnicalSpecialist(client=mock_client)
    res = await tech.analyze("BTC/USDT", "1h", "Test context")
    assert res.trend == "bullish"
    mock_client.chat.completions.create.assert_awaited_once()
