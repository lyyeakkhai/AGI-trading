import secrets
import pyotp
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from itsdangerous import URLSafeTimedSerializer
from packages.config.settings import get_settings

ph = PasswordHasher()

def verify_password(hash: str, password: str) -> bool:
    try:
        ph.verify(hash, password)
        return True
    except VerifyMismatchError:
        return False

def hash_password(password: str) -> str:
    return ph.hash(password)

def verify_totp(secret: str, code: str) -> bool:
    totp = pyotp.TOTP(secret)
    return totp.verify(code)

def generate_csrf_token() -> str:
    return secrets.token_hex(32)

def sign_session(data: dict) -> str:
    settings = get_settings()
    if not settings.auth.dashboard_auth_secret:
        raise ValueError("DASHBOARD_AUTH_SECRET is not set")
    serializer = URLSafeTimedSerializer(settings.auth.dashboard_auth_secret)
    return serializer.dumps(data)

def verify_session(cookie_val: str, max_age: int = 86400) -> dict | None:
    settings = get_settings()
    if not settings.auth.dashboard_auth_secret:
        return None
    serializer = URLSafeTimedSerializer(settings.auth.dashboard_auth_secret)
    try:
        return serializer.loads(cookie_val, max_age=max_age)
    except Exception:
        return None
