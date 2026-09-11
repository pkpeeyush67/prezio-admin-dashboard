def test_dashboard_stats_come_from_seeded_customers(client, auth_headers):
    response = client.get("/api/dashboard/stats", headers=auth_headers)

    assert response.status_code == 200
    body = response.json()
    assert body["total_customers"] == 12
    assert body["active_customers"] == 8
    assert body["inactive_customers"] == 4
    assert body["added_last_30_days"] == 5


def test_customers_are_filtered_and_paginated_by_api(client, auth_headers):
    response = client.get(
        "/api/customers?page=1&page_size=2&status=active&sort_by=name&sort_order=asc",
        headers=auth_headers,
    )

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 8
    assert len(body["items"]) == 2
    assert all(customer["status"] == "active" for customer in body["items"])


def test_customer_search_matches_company(client, auth_headers):
    response = client.get("/api/customers?search=NovaCore", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["total"] == 1
    assert response.json()["items"][0]["name"] == "Aarav Mehta"


def test_dashboard_requires_authentication(client):
    response = client.get("/api/dashboard/stats")

    assert response.status_code == 401
