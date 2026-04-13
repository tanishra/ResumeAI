from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ResumeTask:
    description: str
    expected_output: str


def _format_grounding_feedback(issues: list[dict[str, Any]] | None) -> str:
    if not issues:
        return ""

    formatted_issues = []
    for issue in issues:
        issue_type = str(issue.get("type", "issue")).replace("_", " ")
        items = ", ".join(str(item) for item in issue.get("items", []))
        formatted_issues.append(f"- {issue_type}: {items}")

    return "\n".join(formatted_issues)


def parse_resume_task(agent, raw_resume_text):
    del agent
    return ResumeTask(
        description=(
            f"Clean this resume text:\n\n{raw_resume_text}\n\n"
            "Remove OCR/file artifacts, normalize bullets to '-', and preserve every factual detail. "
            "Do not invent, infer, or delete achievements, dates, employers, titles, education, skills, or metrics. "
            "Return only the cleaned resume text."
        ),
        expected_output="Clean resume text with proper structure.",
    )


def rewrite_for_ats_task(
    agent,
    cleaned_resume_text,
    job_title,
    job_description,
    *,
    previous_candidate: str | None = None,
    grounding_issues: list[dict[str, Any]] | None = None,
):
    del agent
    repair_context = ""
    if previous_candidate:
        repair_context += (
            f"\nPREVIOUS DRAFT: {previous_candidate}\n\n"
            "Revise the previous draft instead of starting over from scratch. "
        )
    if grounding_issues:
        repair_context += (
            "The previous draft introduced unsupported details. Remove or rephrase them while "
            "keeping grounded improvements where possible.\n"
            f"Unsupported details:\n{_format_grounding_feedback(grounding_issues)}\n\n"
        )

    return ResumeTask(
        description=(
            f"Rewrite resume for {job_title}:\n\n"
            f"JOB: {job_description}\n\n"
            f"RESUME: {cleaned_resume_text}\n\n"
            f"{repair_context}"
            "Rewrite the resume to improve ATS alignment using only facts already present in the resume. "
            "Preserve employer names, dates, titles, education, projects, skills, and metrics unless you are only reordering or rephrasing them. "
            "Do not invent employers, dates, projects, technologies, certifications, degrees, metrics, or outcomes. "
            "If the source resume lacks a metric, improve the wording without adding a number. "
            "Prefer conservative edits over aggressive rewriting. "
            "Return only the rewritten resume text with no code fences, intro, or commentary."
        ),
        expected_output="ATS-optimized resume with keyword placement and metrics.",
    )


def refine_bullets_task(
    agent,
    rewritten_resume_text,
    *,
    source_resume_text: str | None = None,
    previous_candidate: str | None = None,
    grounding_issues: list[dict[str, Any]] | None = None,
):
    del agent
    source_context = f"SOURCE OF TRUTH: {source_resume_text}\n\n" if source_resume_text else ""
    repair_context = ""
    if previous_candidate:
        repair_context += (
            f"PREVIOUS DRAFT: {previous_candidate}\n\n"
            "Revise the previous draft instead of starting over from scratch. "
        )
    if grounding_issues:
        repair_context += (
            "The previous draft introduced unsupported details. Remove or rephrase them while "
            "keeping grounded improvements where possible.\n"
            f"Unsupported details:\n{_format_grounding_feedback(grounding_issues)}\n\n"
        )

    return ResumeTask(
        description=(
            f"Refine this resume for clarity and impact:\n\n{rewritten_resume_text}\n\n"
            f"{source_context}{repair_context}"
            "Strengthen verbs, tighten phrasing, and improve readability while preserving factual accuracy. "
            "Do not add numbers, metrics, tools, achievements, or claims that are not already supported by the text. "
            "Keep the same overall sections and factual content. "
            "Return only the refined resume text with no code fences, intro, or commentary."
        ),
        expected_output="Resume with enhanced bullet points and metrics.",
    )


def evaluate_ats_task(agent, final_resume_text, job_title, job_description):
    del agent
    return ResumeTask(
        description=(
            f"Score this resume for {job_title}:\n\n"
            f"JOB: {job_description}\n\n"
            f"RESUME: {final_resume_text}\n\n"
            "Return a JSON object only. Do not include markdown code fences or any other text.\n"
            "The output must be valid JSON matching this schema:\n"
            "{\n"
            '  "overall_score": 0,\n'
            '  "breakdown": {\n'
            '    "keyword_match": 0,\n'
            '    "sections_coverage": 0,\n'
            '    "measurable_impact": 0,\n'
            '    "readability": 0,\n'
            '    "formatting_simplicity": 0\n'
            "  },\n"
            '  "missing_keywords": [],\n'
            '  "quick_wins": [],\n'
            '  "strengths": [],\n'
            '  "summary": "",\n'
            '  "recommendation": ""\n'
            "}\n"
            "Scores in breakdown must be integers from 1 to 5. overall_score must be 0 to 100."
        ),
        expected_output="JSON evaluation object.",
    )
