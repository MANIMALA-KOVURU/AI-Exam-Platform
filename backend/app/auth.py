from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from jose import jwt
from passlib.context import CryptContext

from .config import get_settings

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_token(subject: str, role: str, secret_name: str, minutes: int) -> str:
    settings = get_settings()
    secret = getattr(settings, secret_name)
    expires = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    payload: Dict[str, Any] = {"sub": subject, "role": role, "exp": expires}
    return jwt.encode(payload, secret, algorithm=settings.jwt_algorithm)


def create_access_token(subject: str, role: str) -> str:
    settings = get_settings()
    return create_token(subject, role, "jwt_secret", settings.access_token_minutes)


def create_refresh_token(subject: str, role: str) -> str:
    settings = get_settings()
    return create_token(subject, role, "jwt_refresh_secret", settings.refresh_token_days * 24 * 60)


def decode_token(token: str) -> Dict[str, Any]:
    settings = get_settings()
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
