from backend.app.services.validation import (
    enforce_resume_grounding,
    validate_resume_grounding,
)


def test_validate_resume_grounding_flags_new_metrics_and_tools():
    source_text = """
    JOHN SMITH
    EXPERIENCE
    - Built internal dashboards with Python.
    """
    candidate_text = """
    JOHN SMITH
    EXPERIENCE
    - Built internal dashboards with Python and Kubernetes.
    - Improved system uptime by 40% in 2024.
    """

    validation = validate_resume_grounding(source_text, candidate_text)

    assert validation["passed"] is False
    issue_types = {issue["type"] for issue in validation["issues"]}
    assert "tools" in issue_types
    assert "metrics" in issue_types
    assert "dates" in issue_types


def test_enforce_resume_grounding_falls_back_when_candidate_adds_claims():
    source_text = """
    JANE DOE
    EXPERIENCE
    - Built reporting workflows in Python.
    """
    candidate_text = """
    JANE DOE
    EXPERIENCE
    - Built reporting workflows in Python and AWS.
    - Reduced costs by 30%.
    """
    fallback_text = "JANE DOE\nEXPERIENCE\n- Built reporting workflows in Python."

    accepted_text, report = enforce_resume_grounding(
        source_text=source_text,
        candidate_text=candidate_text,
        fallback_text=fallback_text,
        stage="rewrite",
    )

    assert accepted_text == fallback_text
    assert report["used_fallback"] is True
    assert report["passed"] is False


def test_enforce_resume_grounding_keeps_grounded_candidate():
    source_text = """
    JANE DOE
    EXPERIENCE
    - Built reporting workflows in Python.
    - Reduced manual effort by 30% in 2024.
    """
    candidate_text = """
    JANE DOE
    EXPERIENCE
    - Built Python reporting workflows.
    - Reduced manual effort by 30% in 2024.
    """

    accepted_text, report = enforce_resume_grounding(
        source_text=source_text,
        candidate_text=candidate_text,
        fallback_text=source_text,
        stage="final_resume",
    )

    assert accepted_text == candidate_text
    assert report["used_fallback"] is False
    assert report["passed"] is True
