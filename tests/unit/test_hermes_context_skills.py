from unittest.mock import MagicMock

import pytest

from services.hermes.context import ContextAssembler


@pytest.mark.asyncio
async def test_context_assembler_loads_constitution_and_skills():
    assembler = ContextAssembler()

    # Constitution should be loaded from skills/trading/Trader_Constitution.md
    assert "Trader Constitution" in assembler._load_constitution()
    assert "not found" not in assembler._load_constitution()

    # Skills should be loaded
    skills = assembler._load_trading_skills()
    assert len(skills) > 0
    assert any("breakout" in k.lower() or "trend" in k.lower() for k in skills)


@pytest.mark.asyncio
async def test_context_assembler_assemble_includes_skills_and_constitution():
    assembler = ContextAssembler()
    assembler.tools_client = MagicMock()
    assembler.tools_client.get_market_candles.return_value = [{"close": 50000}]
    assembler.tools_client.get_analytics_indicators.return_value = {"rsi": 45}
    assembler.tools_client.get_portfolio_positions.return_value = []

    ctx = await assembler.assemble("BTC/USDT", "1h")
    assert ctx["symbol"] == "BTC/USDT"
    assert ctx["timeframe"] == "1h"
    assert "Trader Constitution" in ctx["constitution"]
    assert "skills" in ctx
    assert len(ctx["skills"]) > 0
    assert any("trend" in k.lower() for k in ctx["skills"])


def test_context_assembler_missing_files_fallback(tmp_path):
    assembler = ContextAssembler(
        constitution_path=str(tmp_path / "non_existent.md"),
        skills_dir=str(tmp_path / "non_existent_dir"),
    )
    assert assembler._load_constitution() == "Trader Constitution not found."
    assert assembler._load_trading_skills() == {}
