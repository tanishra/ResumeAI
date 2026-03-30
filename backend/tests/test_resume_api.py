from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.app.main import app


client = TestClient(app)


def test_health_endpoint_returns_ok():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_analyze_rejects_unsupported_file_type():
    response = client.post(
        "/resume/analyze",
        files={"file": ("resume.exe", b"binary", "application/octet-stream")},
        data={"job_title": "Engineer", "job_description": "Build systems"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Unsupported file type. Use PDF, DOCX, or TXT."


def test_analyze_rejects_empty_job_description():
    response = client.post(
        "/resume/analyze",
        files={"file": ("resume.txt", b"some text", "text/plain")},
        data={"job_title": "Engineer", "job_description": "   "},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Job description is required."


def test_analyze_returns_structured_results():
    with patch("backend.app.routers.resume.analyze_resume") as mock_analyze:
        mock_analyze.return_value = {
            "cleaned": "cleaned",
            "rewritten": "rewritten",
            "final_resume": "final",
            "evaluation": {"overall_score": 88, "breakdown": {"keyword_match": 4}},
            "docx_bytes": b"docx",
        }

        response = client.post(
            "/resume/analyze",
            files={"file": ("resume.txt", b"resume text", "text/plain")},
            data={"job_title": "Engineer", "job_description": "Build systems"},
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["results"]["evaluation"]["overall_score"] == 88
