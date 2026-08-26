from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from packages.auth.security import verify_password, verify_totp, sign_session, generate_csrf_token, hash_password
from packages.config.settings import get_settings
import pyotp

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

class LoginRequest(BaseModel):
    password: str
    totp_code: str

class LoginResponse(BaseModel):
    csrf_token: str

@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest, response: Response):
    settings = get_settings()
    
    if not settings.auth.dashboard_owner_password_hash:
        raise HTTPException(status_code=500, detail="Owner password not configured")
    if not verify_password(settings.auth.dashboard_owner_password_hash, req.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if not settings.auth.dashboard_totp_secret:
        raise HTTPException(status_code=500, detail="TOTP secret not configured")
    if not verify_totp(settings.auth.dashboard_totp_secret, req.totp_code):
        raise HTTPException(status_code=401, detail="Invalid TOTP code")
        
    csrf_token = generate_csrf_token()
    session_data = {"role": "owner", "csrf_token": csrf_token}
    signed_cookie = sign_session(session_data)
    
    response.set_cookie(
        key="session",
        value=signed_cookie,
        httponly=True,
        samesite="lax",
        secure=settings.app.env == "production",
        max_age=86400
    )
    
    return LoginResponse(csrf_token=csrf_token)

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="session")
    return {"message": "Logged out"}

class SetupRequest(BaseModel):
    password: str

class SetupResponse(BaseModel):
    totp_secret: str
    totp_uri: str
    password_hash: str

@router.post("/totp/setup", response_model=SetupResponse)
async def setup_totp(req: SetupRequest):
    # In a real app this would be restricted, but for initial setup it's open
    # until DAHBOARD_OWNER_PASSWORD_HASH is set. We just generate values.
    settings = get_settings()
    if settings.auth.dashboard_owner_password_hash:
        raise HTTPException(status_code=400, detail="Already setup")
        
    totp_secret = pyotp.random_base32()
    totp_uri = pyotp.totp.TOTP(totp_secret).provisioning_uri(name="owner", issuer_name="AGI-Trading")
    password_hash = hash_password(req.password)
    
    return SetupResponse(
        totp_secret=totp_secret,
        totp_uri=totp_uri,
        password_hash=password_hash
    )
