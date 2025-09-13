from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_embedding_requires_config(monkeypatch):
    # When no env is configured, embedding should 500 with config message
    resp = client.post(
        "/api/embedding", json={"user_id": "u", "hobbies": "x", "about": "y"})
    assert resp.status_code in (400, 500)
