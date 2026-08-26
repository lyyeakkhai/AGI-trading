import httpx
from typing import Any, Dict, List

class HermesToolsClient:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.headers = {"Authorization": f"Bearer {token}"}
        self.client = httpx.Client(base_url=self.base_url, headers=self.headers)

    def get_market_price(self, symbol: str) -> Dict[str, Any]:
        resp = self.client.get("/api/v1/tools/market/price", params={"symbol": symbol})
        resp.raise_for_status()
        return resp.json()

    def get_market_candles(self, symbol: str, timeframe: str) -> Dict[str, Any]:
        resp = self.client.get("/api/v1/tools/market/candles", params={"symbol": symbol, "timeframe": timeframe})
        resp.raise_for_status()
        return resp.json()

    def get_analytics_indicators(self, symbol: str) -> Dict[str, Any]:
        resp = self.client.get("/api/v1/tools/analytics/indicators", params={"symbol": symbol})
        resp.raise_for_status()
        return resp.json()

    def get_portfolio_positions(self) -> Dict[str, Any]:
        resp = self.client.get("/api/v1/tools/portfolio/positions")
        resp.raise_for_status()
        return resp.json()

    def get_strategy_list(self) -> Dict[str, Any]:
        resp = self.client.get("/api/v1/tools/strategy/list")
        resp.raise_for_status()
        return resp.json()

    def create_trade_proposal(self, intent: Dict[str, Any]) -> Dict[str, Any]:
        resp = self.client.post("/api/v1/tools/proposal/create", json=intent)
        resp.raise_for_status()
        return resp.json()

    def search_knowledge(self, query: str) -> Dict[str, Any]:
        resp = self.client.get("/api/v1/tools/knowledge/search", params={"query": query})
        resp.raise_for_status()
        return resp.json()

    def store_memory(self, observation: Dict[str, Any]) -> Dict[str, Any]:
        resp = self.client.post("/api/v1/tools/memory/store", json=observation)
        resp.raise_for_status()
        return resp.json()

    def search_memory(self, query: str) -> Dict[str, Any]:
        resp = self.client.get("/api/v1/tools/memory/search", params={"query": query})
        resp.raise_for_status()
        return resp.json()
