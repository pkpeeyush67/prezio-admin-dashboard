from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings

sqlite_options = (
    {"check_same_thread": False}
    if settings.database_url.startswith("sqlite")
    else {}
)

if settings.database_url.startswith("sqlite:///./"):
    database_path = settings.database_url.removeprefix("sqlite:///./")
    Path(database_path).parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(settings.database_url, connect_args=sqlite_options)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    pass


def get_db():
    database = SessionLocal()
    try:
        yield database
    finally:
        database.close()
