def test_customer_crud_and_activity(client, auth_headers):
    created = client.post(
        "/api/customers",
        headers=auth_headers,
        json={
            "name": "Neha Kapoor",
            "email": "neha@example.com",
            "company": "Acme India",
            "status": "active",
        },
    )
    assert created.status_code == 201
    customer_id = created.json()["id"]

    details = client.get(f"/api/customers/{customer_id}", headers=auth_headers)
    assert details.status_code == 200
    assert details.json()["company"] == "Acme India"

    updated = client.put(
        f"/api/customers/{customer_id}",
        headers=auth_headers,
        json={
            "name": "Neha Kapoor",
            "email": "neha@example.com",
            "company": "Acme Technologies",
            "status": "inactive",
        },
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "inactive"

    activity = client.get(
        f"/api/customers/{customer_id}/activity", headers=auth_headers
    )
    assert activity.status_code == 200
    assert [item["action"] for item in activity.json()] == ["updated", "created"]

    deleted = client.delete(f"/api/customers/{customer_id}", headers=auth_headers)
    assert deleted.status_code == 204
    assert client.get(f"/api/customers/{customer_id}", headers=auth_headers).status_code == 404


def test_customer_validation_and_duplicate_email(client, auth_headers):
    invalid = client.post(
        "/api/customers",
        headers=auth_headers,
        json={"name": "N", "email": "wrong", "company": "A", "status": "unknown"},
    )
    assert invalid.status_code == 422

    duplicate = client.post(
        "/api/customers",
        headers=auth_headers,
        json={
            "name": "Duplicate User",
            "email": "aarav@novacore.in",
            "company": "NovaCore",
            "status": "active",
        },
    )
    assert duplicate.status_code == 409
