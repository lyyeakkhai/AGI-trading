from typing import Annotated
from fastapi import Depends, Header, HTTPException, status
from packages.config import get_settings, Settings

def verify_hermes_token(
    authorization: Annotated[str, Header()] = "",
    settings: Annotated[Settings, Depends(get_settings)] = None
) -> None:
    expected_token = settings.hermes.service_token
    if not expected_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hermes service token not configured"
        )
    if authorization != f"Bearer {expected_token}":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Hermes service token"
        )

def verify_tradingagents_token(
    authorization: Annotated[str, Header()] = "",
    settings: Annotated[Settings, Depends(get_settings)] = None
) -> None:
    expected_token = settings.trading_agents.service_token
    if not expected_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="TradingAgents service token not configured"
        )
    if authorization != f"Bearer {expected_token}":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid TradingAgents service token"
        )

def verify_owner_session(
    authorization: Annotated[str, Header()] = "",
    settings: Annotated[Settings, Depends(get_settings)] = None
) -> None:
    expected_token = settings.auth.dashboard_auth_secret
    if not expected_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Dashboard auth secret not configured"
        )
    if authorization != f"Bearer {expected_token}":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid owner session token"
        )
