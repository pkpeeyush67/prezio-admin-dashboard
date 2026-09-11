import os


class Settings:
    database_url = os.getenv("DATABASE_URL", "sqlite:///./data/prezio.db")
    jwt_secret = os.getenv("JWT_SECRET", "local-development-secret")
    token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    cors_origins = os.getenv(
        "CORS_ORIGINS", "http://localhost:3000,http://localhost:5173"
    ).split(",")


settings = Settings()
