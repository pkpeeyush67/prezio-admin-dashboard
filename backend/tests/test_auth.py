def test_register_login_and_current_admin(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["email"] == "admin@example.com"


def test_login_rejects_invalid_password(client, auth_headers):
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "incorrect-password"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password."


def test_registration_validates_input(client):
    response = client.post(
        "/api/auth/register",
        json={"name": "P", "email": "wrong", "password": "short"},
    )

    assert response.status_code == 422
