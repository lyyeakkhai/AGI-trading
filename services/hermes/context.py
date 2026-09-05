import logging
import os
from pathlib import Path
from typing import Any

from packages.config.settings import get_settings
from packages.hermes_tools.client import HermesToolsClient

logger = logging.getLogger(__name__)


class ContextAssembler:
    def __init__(
        self,
        constitution_path: str | None = None,
        skills_dir: str | None = None,
    ):
        self.settings = get_settings()
        self.tools_client = HermesToolsClient(
            base_url=self.settings.hermes.base_url,
            token=self.settings.hermes.service_token,
        )
        repo_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.skills_dir = skills_dir or os.path.join(repo_root, "skills", "trading")
        self.constitution_path = constitution_path or os.path.join(
            self.skills_dir,
            "Trader_Constitution.md",
        )

    def _load_constitution(self) -> str:
        try:
            with open(self.constitution_path, encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            return "Trader Constitution not found."

    def _load_trading_skills(self) -> dict[str, str]:
        skills: dict[str, str] = {}
        if not os.path.exists(self.skills_dir):
            return skills

        skills_path = Path(self.skills_dir)
        for skill_file in sorted(skills_path.rglob("*.md")):
            # Skip top-level constitution and readme
            if skill_file.resolve() == Path(self.constitution_path).resolve():
                continue
            if skill_file.name.lower() == "readme.md":
                continue

            # If named SKILL.md, use parent directory name as skill key
            if skill_file.name.lower() == "skill.md":
                skill_name = skill_file.parent.name
            else:
                skill_name = skill_file.stem

            try:
                with open(skill_file, encoding="utf-8") as f:
                    skills[skill_name] = f.read()
            except Exception as e:
                logger.warning(f"Failed to read skill file {skill_file}: {e}")
                continue

        return skills

    async def assemble(self, symbol: str, timeframe: str) -> dict[str, Any]:
        # Tools client uses synchronous HTTP; call synchronously or in executor
        constitution = self._load_constitution()
        skills = self._load_trading_skills()
        market_candles = self.tools_client.get_market_candles(symbol, timeframe)
        indicators = self.tools_client.get_analytics_indicators(symbol)
        positions = self.tools_client.get_portfolio_positions()

        return {
            "symbol": symbol,
            "timeframe": timeframe,
            "constitution": constitution,
            "skills": skills,
            "strategy_rules": skills,
            "market_candles": market_candles,
            "indicators": indicators,
            "positions": positions,
        }
