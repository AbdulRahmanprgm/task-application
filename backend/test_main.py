from fastapi.testclient import TestClient
import time
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data

def test_register():
    payload = {
        "email": "test@example.com",
        "username": "tester",
        "password": "password123"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "user_id" in data
    assert data["message"] == "User registered successfully"

def test_login_success():
    payload = {"username": "admin", "password": "admin123"}
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["access_token"] == "mock-jwt-token-777"
    assert data["token_type"] == "bearer"

def test_login_failure():
    payload = {"username": "wrong", "password": "badpassword"}
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401

def test_get_profile():
    # Unauthorized request
    response = client.get("/api/auth/me")
    assert response.status_code == 401

    # Authorized request
    headers = {"Authorization": "Bearer mock-jwt-token-777"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "admin"
    assert data["role"] == "developer"

def test_async_vision_pipeline():
    # 1. Start Image Analysis
    start_payload = {
        "image_url": "https://example.com/test.jpg",
        "model_type": "object_detection"
    }
    start_res = client.post("/api/vision/analyze-image", json=start_payload)
    assert start_res.status_code == 200
    job_id = start_res.json()["job_id"]

    # 2. Check Status (initial)
    status_res = client.get(f"/api/vision/status/{job_id}")
    assert status_res.status_code == 200
    assert status_res.json()["status"] in ["processing", "completed"]

    # 3. Requesting result before completion (or after waiting)
    result_res = client.get(f"/api/vision/result/{job_id}")
    if status_res.json()["status"] == "processing":
        assert result_res.status_code == 400
    else:
        assert result_res.status_code == 200

def test_analyze_text():
    payload = {"text": "DevOps automation pipeline test"}
    response = client.post("/api/vision/analyze-text", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["sentiment"] == "positive"
    assert "devops" in data["keywords"]
