import logging
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.responses import JSONResponse
from packages.config.settings import get_settings
from packages.domain.research import DeepResearchRequest, SynthesizedResearchReport
from services.tradingagents.orchestrator import DebateOrchestrator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="TradingAgents Microservice")

async def verify_token(authorization: str = Header(None)):
    settings = get_settings()
    expected_token = settings.trading_agents.service_token
    if not expected_token:
        logger.warning("No TRADINGAGENTS_SERVICE_TOKEN configured.")
        return
    if authorization != f"Bearer {expected_token}":
        raise HTTPException(status_code=403, detail="Forbidden")

@app.post("/internal/v1/deep-analyze", response_model=SynthesizedResearchReport)
async def deep_analyze(request: DeepResearchRequest, _: None = Depends(verify_token)):
    try:
        orchestrator = DebateOrchestrator()
        context_str = request.context or ""
        report = await orchestrator.run_deep_research(request.symbol, request.timeframe, context_str)
        return report
    except Exception as e:
        logger.error(f"Error in deep_analyze: {e}", exc_info=True)
        return JSONResponse(status_code=500, content={"detail": str(e)})
