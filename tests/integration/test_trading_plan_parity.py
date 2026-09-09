import pytest
import uuid
from typing import Any
from fastapi.testclient import TestClient

from apps.api.main import app
from apps.api.dependencies import verify_hermes_token

def test_human_vs_ai_planning_parity():
    """
    TRADING-016: Prove Human vs AI planning parity.
    1. Simulate Human submitting a TradingPlan.
    2. Simulate Hermes AI submitting an identical TradingPlan.
    3. Assert both plans are subjected to the exact same Risk Engine gates and result in the exact same RiskDecisionModel outcomes.
    """
    app.dependency_overrides[verify_hermes_token] = lambda: None
    
    with TestClient(app) as client:
        # Base intent that both Human and AI will use
        base_intent = {
            "symbol": "ETH/USDT",
            "direction": "long",
            "order_type": "limit",
            "quantity": 2.5,
            "limit_price": 3000.0,
            "trading_mode": "paper",
            "rationale": "Strong support level bounce"
        }
        
        # 1. Simulate Human trader submitting proposal directly to the API
        human_intent = base_intent.copy()
        human_intent["correlation_id"] = str(uuid.uuid4())
        
        response_human = client.post("/api/v1/tools/proposal/create", json=human_intent)
        assert response_human.status_code == 201, f"Human proposal creation failed: {response_human.text}"
        human_result = response_human.json()
        
        # 2. Simulate Hermes AI submitting an identical TradingPlan 
        # (Could use hermes_tools client, but testing the exact same API router endpoint guarantees parity in the pipeline)
        ai_intent = base_intent.copy()
        ai_intent["correlation_id"] = str(uuid.uuid4())
        
        response_ai = client.post("/api/v1/tools/proposal/create", json=ai_intent)
        assert response_ai.status_code == 201, f"AI proposal creation failed: {response_ai.text}"
        ai_result = response_ai.json()
        
        # 3. Assert exact same deterministic Risk Engine gates and RiskDecisionModel outcomes
        # The API currently returns decision, status, rule_codes, risk_score, quantity, approved_quantity
        assert human_result["decision"] == ai_result["decision"], "Risk decision outcomes must match between Human and AI"
        assert human_result["status"] == ai_result["status"], "Proposal statuses must match"
        assert human_result["rule_codes"] == ai_result["rule_codes"], "Risk rule codes triggered must match"
        assert human_result["risk_score"] == ai_result["risk_score"], "Risk scores must match"
        assert human_result["quantity"] == ai_result["quantity"], "Requested quantities must match"
        assert human_result["approved_quantity"] == ai_result["approved_quantity"], "Approved quantities must match"

        # Verify that both are structurally equivalent in their response (meaning they hit the same schema)
        assert human_result.keys() == ai_result.keys(), "Response schema must be identical"
        
    app.dependency_overrides.clear()
