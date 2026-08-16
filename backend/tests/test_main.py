# tests/test_main.py
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "SpecMatch AI FastAPI Backend with GraphRAG is Running Successfully!"}

def test_analyze_rfp_no_file():
    response = client.post("/analyze-rfp/")
    assert response.status_code == 422