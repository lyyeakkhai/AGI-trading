import logging
import httpx
from typing import Dict, Any, Optional
from packages.config.settings import get_settings

logger = logging.getLogger(__name__)

class ResearchClient:
    def __init__(self):
        self.settings = get_settings()
        self.base_url = self.settings.hermes.base_url
        self.token = self.settings.hermes.service_token

    async def trigger_deep_research(self, symbol: str, timeframe: str, context: str = "") -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}/api/v1/tools/research/deep_analyze"
        headers = {"Authorization": f"Bearer {self.token}"}
        payload = {
            "symbol": symbol,
            "timeframe": timeframe,
            "context": context
        }
        
        async with httpx.AsyncClient() as client:
            try:
                # Strictly enforce timeout as per F10 spec
                resp = await client.post(
                    url, json=payload, headers=headers, timeout=30.0
                )
                resp.raise_for_status()
                return resp.json()
            except httpx.TimeoutException:
                logger.warning(f"Deep research timed out for {symbol} after 30 seconds.")
                return None
            except Exception as e:
                logger.warning(f"Deep research failed for {symbol}: {e}")
                return None
