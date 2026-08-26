from typing import Annotated
from fastapi import Depends, Header, HTTPException, status, Request, Cookie
from packages.config import get_settings, Settings
from packages.auth.security import verify_session

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
    request: Request,
    session: Annotated[str | None, Cookie()] = None,
    x_csrf_token: Annotated[str | None, Header()] = None
) -> dict:
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing session cookie"
        )
    
    session_data = verify_session(session)
    if not session_data or session_data.get("role") != "owner":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session"
        )
        
    if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
        expected_csrf = session_data.get("csrf_token")
        if not expected_csrf or x_csrf_token != expected_csrf:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF token missing or invalid"
            )
            
    return session_data
