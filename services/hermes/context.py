import os
from typing import Dict, Any
from packages.hermes_tools.client import HermesToolsClient
from packages.config.settings import get_settings

class ContextAssembler:
    def __init__(self):
        self.settings = get_settings()
        self.tools_client = HermesToolsClient(
            base_url=self.settings.hermes.base_url,
            token=self.settings.hermes.service_token
        )
        self.constitution_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
            "Trader_Constitution.md"
        )

    def _load_constitution(self) -> str:
        try:
            with open(self.constitution_path, 'r') as f:
                return f.read()
        except FileNotFoundError:
            return "Trader Constitution not found."

    async def assemble(self, symbol: str, timeframe: str) -> Dict[str, Any]:
        # The tools client in packages/hermes_tools/client.py is synchronous, but we can wrap it or just call it directly in an executor, 
        # or rewrite the client. Wait, the client is using httpx.Client (sync). I'll just call it synchronously since it's blocking, 
        # but in a real async environment we'd use run_in_executor or httpx.AsyncClient. For simplicity, just call it.
        
        constitution = self._load_constitution()
        market_candles = self.tools_client.get_market_candles(symbol, timeframe)
        indicators = self.tools_client.get_analytics_indicators(symbol)
        positions = self.tools_client.get_portfolio_positions()

        return {
            "symbol": symbol,
            "timeframe": timeframe,
            "constitution": constitution,
            "market_candles": market_candles,
            "indicators": indicators,
            "positions": positions
        }
