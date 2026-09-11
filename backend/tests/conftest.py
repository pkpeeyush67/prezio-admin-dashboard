import os
import tempfile

import pytest

database_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
os.environ["DATABASE_URL"] = f"sqlite:///{database_file.name}"
os.environ["JWT_SECRET"] = "test-secret"

from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="session")
def auth_headers(client: TestClient):
    client.post(
        "/api/auth/register",
        json={
            "name": "Test Administrator",
            "email": "admin@example.com",
            "password": "SecurePass123",
        },
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "SecurePass123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
