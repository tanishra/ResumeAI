import io
from unittest.mock import patch

from fastapi.testclient import TestClient
from docx import Document

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
            "validation": {
                "rewrite": {"stage": "rewrite", "passed": True, "used_fallback": False, "issues": []},
                "final_resume": {"stage": "final_resume", "passed": True, "used_fallback": False, "issues": []},
            },
            "telemetry": {
                "file_type": "txt",
                "timings_ms": {"total": 12.5},
                "grounding": {},
                "pipeline": {"stages": [{"stage": "parse", "succeeded": True, "used_fallback": False}]},
                "evaluation": {"source": "model_json"},
            },
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
    assert payload["results"]["validation"]["rewrite"]["passed"] is True
    assert payload["results"]["telemetry"]["pipeline"]["stages"][0]["stage"] == "parse"
    assert payload["results"]["telemetry"]["evaluation"]["source"] == "model_json"


def test_analyze_returns_422_for_extraction_failures():
    with patch("backend.app.routers.resume.analyze_resume") as mock_analyze:
        from backend.app.services.errors import ResumeExtractionError

        mock_analyze.side_effect = ResumeExtractionError("No text could be extracted from the resume file.")

        response = client.post(
            "/resume/analyze",
            files={"file": ("resume.txt", b"resume text", "text/plain")},
            data={"job_title": "Engineer", "job_description": "Build systems"},
        )

    assert response.status_code == 422
    assert response.json()["detail"] == "No text could be extracted from the resume file."
    assert response.headers["x-error-code"] == "resume_extraction_failed"


def test_analyze_returns_503_for_upstream_ai_failures():
    with patch("backend.app.routers.resume.analyze_resume") as mock_analyze:
        from backend.app.services.errors import UpstreamModelError

        mock_analyze.side_effect = UpstreamModelError(
            "The upstream AI service is unavailable or rejected the request. Please try again."
        )

        response = client.post(
            "/resume/analyze",
            files={"file": ("resume.txt", b"resume text", "text/plain")},
            data={"job_title": "Engineer", "job_description": "Build systems"},
        )

    assert response.status_code == 503
    assert response.headers["x-error-code"] == "upstream_model_error"


def test_download_docx_uses_final_resume_without_rerunning_analysis():
    final_resume = "JANE DOE\nSUMMARY\nBuilt reliable backend APIs."

    with patch("backend.app.routers.resume.analyze_resume") as mock_analyze:
        response = client.post(
            "/resume/download-docx",
            data={"final_resume": final_resume},
        )

    assert response.status_code == 200
    assert response.headers["content-type"] == (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    assert "attachment; filename=final_resume.docx" == response.headers["content-disposition"]
    mock_analyze.assert_not_called()

    document = Document(io.BytesIO(response.content))
    assert [paragraph.text for paragraph in document.paragraphs] == [
        "JANE DOE",
        "SUMMARY",
        "Built reliable backend APIs.",
    ]


def test_download_docx_rejects_empty_final_resume():
    response = client.post(
        "/resume/download-docx",
        data={"final_resume": "   "},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Final resume content is required."
