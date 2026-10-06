from functools import lru_cache
from typing import List

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    environment: str = "development"
    database_url: str = "sqlite:///./aiexam.db"
    jwt_secret: str = "change-this-development-secret"
    jwt_refresh_secret: str = "change-this-development-refresh-secret"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60
    refresh_token_days: int = 7
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"
    frontend_url: str = "http://localhost:3000"
    openai_api_key: str = ""
    initial_admin_email: str = "admin@aiexamplatform.com"
    initial_admin_password: str = "Admin@123"
    upload_dir: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+psycopg://", 1)
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+psycopg://", 1)
        return value

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.environment.lower() != "production":
            return self

        if not self.database_url.startswith("postgresql+psycopg://"):
            raise ValueError("Production DATABASE_URL must point to PostgreSQL")
        if len(self.jwt_secret) < 32 or len(self.jwt_refresh_secret) < 32:
            raise ValueError("Production JWT secrets must contain at least 32 characters")
        if self.jwt_secret == self.jwt_refresh_secret:
            raise ValueError("Production access and refresh JWT secrets must be different")
        if self.initial_admin_email and self.initial_admin_password:
            if len(self.initial_admin_password) < 12:
                raise ValueError("Production INITIAL_ADMIN_PASSWORD must contain at least 12 characters")
        if not self.cors_list or "*" in self.cors_list:
            raise ValueError("Production CORS_ORIGINS must list explicit frontend origins")
        if self.frontend_url not in self.cors_list:
            raise ValueError("FRONTEND_URL must also be included in CORS_ORIGINS")
        return self

    @property
    def cors_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
