from unittest.mock import patch

from backend.app.services.analyzer import analyze_resume


def test_analyze_resume_repairs_rewrite_before_fallback():
    with patch("backend.app.services.analyzer.detect_and_extract", return_value=("txt", "JANE DOE\nEXPERIENCE\n- Built Python APIs.")), \
         patch("crew_app.crew.run_pipeline", return_value=(
             "JANE DOE\nEXPERIENCE\n- Built Python APIs.",
             "JANE DOE\nEXPERIENCE\n- Built Python APIs with AWS.",
             "JANE DOE\nEXPERIENCE\n- Built Python APIs with AWS.",
             '{"overall_score": 75, "breakdown": {"keyword_match": 4}}',
         )), \
         patch("crew_app.crew.repair_rewrite", return_value="JANE DOE\nEXPERIENCE\n- Built Python APIs."), \
         patch("crew_app.crew.repair_final_resume", return_value="JANE DOE\nEXPERIENCE\n- Built Python APIs."):
        result = analyze_resume(
            "resume.txt",
            b"resume text",
            "Backend Engineer",
            "Need Python APIs",
        )

    assert result["rewritten"] == "JANE DOE\nEXPERIENCE\n- Built Python APIs."
    assert result["validation"]["rewrite"]["repair_attempted"] is True
    assert result["validation"]["rewrite"]["repair_succeeded"] is True
    assert result["validation"]["rewrite"]["used_fallback"] is False
    assert result["telemetry"]["grounding"]["rewrite"]["repair_succeeded"] is True
    assert result["telemetry"]["evaluation"]["source"] == "model_json"


def test_analyze_resume_falls_back_after_failed_repair():
    cleaned = "JANE DOE\nEXPERIENCE\n- Built Python APIs."

    with patch("backend.app.services.analyzer.detect_and_extract", return_value=("txt", cleaned)), \
         patch("crew_app.crew.run_pipeline", return_value=(
             cleaned,
             "JANE DOE\nEXPERIENCE\n- Built Python APIs with AWS.",
             "JANE DOE\nEXPERIENCE\n- Built Python APIs with Kubernetes.",
             '{"overall_score": 75, "breakdown": {"keyword_match": 4}}',
         )), \
         patch("crew_app.crew.repair_rewrite", return_value="JANE DOE\nEXPERIENCE\n- Built Python APIs with AWS."), \
         patch("crew_app.crew.repair_final_resume", return_value="JANE DOE\nEXPERIENCE\n- Built Python APIs with Kubernetes."):
        result = analyze_resume(
            "resume.txt",
            b"resume text",
            "Backend Engineer",
            "Need Python APIs",
        )

    assert result["rewritten"] == cleaned
    assert result["final_resume"] == cleaned
    assert result["validation"]["rewrite"]["used_fallback"] is True
    assert result["validation"]["final_resume"]["used_fallback"] is True
    assert result["telemetry"]["grounding"]["final_resume"]["used_fallback"] is True
