from backend.app.services.evaluation import (
    build_rule_based_evaluation,
    normalize_evaluation_payload,
)


def test_normalize_evaluation_payload_accepts_valid_json():
    raw_output = """
    {
      "overall_score": 82,
      "breakdown": {
        "keyword_match": 4,
        "sections_coverage": 5,
        "measurable_impact": 3,
        "readability": 4,
        "formatting_simplicity": 5
      },
      "missing_keywords": ["python", "fastapi"],
      "quick_wins": ["Add more backend keywords."],
      "strengths": ["Good section structure."],
      "summary": "Solid draft.",
      "recommendation": "Align missing backend skills."
    }
    """

    normalized, telemetry = normalize_evaluation_payload(
        raw_output=raw_output,
        resume_text="SUMMARY\nBuilt APIs and improved performance.",
        job_description="Need Python FastAPI backend engineer.",
    )

    assert normalized["overall_score"] == 82
    assert normalized["breakdown"]["sections_coverage"] == 5
    assert normalized["missing_keywords"] == ["python", "fastapi"]
    assert normalized["strengths"] == ["Good section structure."]
    assert telemetry["source"] == "model_json"
    assert telemetry["parsed_json"] is True


def test_normalize_evaluation_payload_falls_back_to_rule_based_scores():
    normalized, telemetry = normalize_evaluation_payload(
        raw_output="not json at all",
        resume_text="SUMMARY\nSKILLS\nEXPERIENCE\nBuilt dashboards and improved latency by 35%.",
        job_description="Looking for a Python engineer with dashboard experience.",
    )

    assert "raw_output" in normalized
    assert normalized["overall_score"] >= 0
    assert set(normalized["breakdown"].keys()) == {
        "keyword_match",
        "sections_coverage",
        "measurable_impact",
        "readability",
        "formatting_simplicity",
    }
    assert isinstance(normalized["quick_wins"], list)
    assert telemetry["source"] == "rule_based_fallback"
    assert telemetry["parsed_json"] is False


def test_rule_based_evaluation_includes_summary_and_recommendation():
    evaluation = build_rule_based_evaluation(
        resume_text="SUMMARY\nSKILLS\nEXPERIENCE\nLed automation work that reduced costs by 20%.",
        job_description="Automation engineer with Python and cloud experience.",
    )

    assert evaluation["summary"]
    assert evaluation["recommendation"]
    assert evaluation["strengths"]
