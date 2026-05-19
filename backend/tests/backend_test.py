"""Backend API tests for Japon Bot Dashboard (FastAPI proxy)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://discord-bot-hub-51.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_PASSWORD = "japon2024"
SAMPLE_SERVER_ID = "1472440996578201793"


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/auth/login", json={"password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 0
    return data["token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# -------- Auth --------
class TestAuth:
    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login", json={"password": "wrong"}, timeout=20)
        assert r.status_code == 401

    def test_login_success(self, token):
        assert len(token) > 10

    def test_protected_without_auth(self):
        r = requests.get(f"{API}/servidores", timeout=20)
        assert r.status_code == 401

    def test_protected_invalid_token(self):
        r = requests.get(f"{API}/servidores", headers={"Authorization": "Bearer faketoken"}, timeout=20)
        assert r.status_code == 401


# -------- Proxy endpoints --------
class TestProxy:
    def test_servidores(self, auth_headers):
        r = requests.get(f"{API}/servidores", headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, dict)
        # API external wraps with {exito, servidores}
        assert "servidores" in data or "exito" in data

    def test_estadisticas(self, auth_headers):
        r = requests.get(f"{API}/estadisticas/{SAMPLE_SERVER_ID}", headers=auth_headers, timeout=30)
        assert r.status_code in (200, 404), r.text
        if r.status_code == 200:
            assert isinstance(r.json(), dict)

    def test_tickets(self, auth_headers):
        r = requests.get(f"{API}/tickets/{SAMPLE_SERVER_ID}", headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, dict) or isinstance(data, list)

    def test_transcript_invalid(self, auth_headers):
        r = requests.get(f"{API}/transcript/invalid-id-xyz", headers=auth_headers, timeout=30)
        # Should be a 4xx/5xx upstream error properly forwarded
        assert r.status_code >= 400

    def test_cerrar_ticket_invalid(self, auth_headers):
        # No real ticket - just verifying request shape passes validation
        r = requests.post(
            f"{API}/cerrar-ticket",
            headers=auth_headers,
            json={"servidorId": SAMPLE_SERVER_ID, "canalId": "000000000000000000"},
            timeout=30,
        )
        # Either upstream error or success
        assert r.status_code in (200, 400, 404, 500, 502)

    def test_cerrar_ticket_validation(self, auth_headers):
        r = requests.post(f"{API}/cerrar-ticket", headers=auth_headers, json={}, timeout=20)
        assert r.status_code == 422

    def test_configurar_servidor_validation(self, auth_headers):
        r = requests.post(f"{API}/configurar-servidor", headers=auth_headers, json={}, timeout=20)
        assert r.status_code == 422
