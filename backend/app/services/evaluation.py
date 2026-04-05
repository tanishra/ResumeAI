import json
import re
from typing import Any


STOP_WORDS = {
    "the", "and", "or", "but", "for", "with", "from", "into", "onto", "that",
    "this", "have", "has", "had", "are", "was", "were", "been", "being", "you",
    "your", "our", "their", "will", "would", "should", "could", "about", "across",
    "after", "before", "than", "then", "them", "they", "his", "her", "she", "him",
    "its", "who", "what", "when", "where", "why", "how", "job", "role", "team",
    "years", "year", "work", "working", "experience", "required", "preferred",
    "plus", "must", "using", "used", "ability", "skills", "skill"
}

STANDARD_SECTIONS = [
    "summary",
    "professional summary",
    "skills",
    "experience",
    "work experience",
    "education",
    "projects",
]

ACTION_VERBS = [
    "led", "built", "developed", "implemented", "designed", "improved", "optimized",
    "delivered", "launched", "managed", "created", "reduced", "increased", "scaled",
    "automated", "analyzed", "architected", "owned", "drove"
]


def extract_json_object(text: str) -> dict[str, Any] | None:
    if not text:
        return None

    stripped = text.strip()
    candidates = [stripped]

    start = stripped.find("{")
    end = stripped.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidates.append(stripped[start : end + 1])

    for candidate in candidates:
        try:
            parsed = json.loads(candidate)
        except json.JSONDecodeError:
            continue
        if isinstance(parsed, dict):
            return parsed

    return None


def build_rule_based_evaluation(resume_text: str, job_description: str) -> dict[str, Any]:
    resume_lower = resume_text.lower()
    job_lower = job_description.lower()

    job_keywords = _extract_keywords(job_lower)
    resume_keywords = _extract_keywords(resume_lower)

    matched_keywords = job_keywords & resume_keywords
    missing_keywords = sorted(job_keywords - resume_keywords)[:8]
    keyword_ratio = (len(matched_keywords) / len(job_keywords)) if job_keywords else 0.0

    section_hits = sum(1 for section in STANDARD_SECTIONS if section in resume_lower)
    section_ratio = min(section_hits / 4, 1.0)

    metric_count = len(re.findall(r"\b\d+(?:\.\d+)?%?\+?\b", resume_text))
    metric_ratio = min(metric_count / 8, 1.0)

    verb_count = sum(1 for verb in ACTION_VERBS if re.search(rf"\b{re.escape(verb)}\b", resume_lower))
    readability_ratio = min((verb_count + section_hits) / 10, 1.0)

    formatting_ratio = 1.0 if len(resume_text.splitlines()) >= 6 else 0.5

    breakdown = {
        "keyword_match": _to_five_point(keyword_ratio),
        "sections_coverage": _to_five_point(section_ratio),
        "measurable_impact": _to_five_point(metric_ratio),
        "readability": _to_five_point(readability_ratio),
        "formatting_simplicity": _to_five_point(formatting_ratio),
    }

    overall_score = round((sum(breakdown.values()) / 25) * 100)

    quick_wins: list[str] = []
    if missing_keywords:
        quick_wins.append(f"Add missing job keywords where accurate: {', '.join(missing_keywords[:3])}.")
    if breakdown["measurable_impact"] <= 3:
        quick_wins.append("Add measurable results to stronger bullets where the original resume supports them.")
    if breakdown["sections_coverage"] <= 3:
        quick_wins.append("Use clearer resume sections such as Summary, Skills, Experience, and Education.")
    if breakdown["readability"] <= 3:
        quick_wins.append("Rewrite long or generic bullets with stronger action verbs and tighter phrasing.")

    strengths: list[str] = []
    if breakdown["keyword_match"] >= 4:
        strengths.append("The resume already reflects a good share of the job's important keywords.")
    if breakdown["sections_coverage"] >= 4:
        strengths.append("Core resume sections are present and easy for ATS systems to parse.")
    if breakdown["measurable_impact"] >= 4:
        strengths.append("The resume includes measurable achievements that improve credibility.")
    if not strengths:
        strengths.append("The resume provides a usable foundation for ATS optimization.")

    summary = (
        f"Keyword alignment is {round(keyword_ratio * 100)}% against the job description. "
        f"The resume includes {metric_count} measurable references and {section_hits} standard section matches."
    )

    recommendation = (
        "Prioritize accurate keyword alignment first, then strengthen bullet specificity without inventing facts."
    )

    return {
        "overall_score": overall_score,
        "breakdown": breakdown,
        "missing_keywords": missing_keywords,
        "quick_wins": quick_wins,
        "strengths": strengths,
        "summary": summary,
        "recommendation": recommendation,
    }


def normalize_evaluation_payload(
    raw_output: str,
    resume_text: str,
    job_description: str,
) -> tuple[dict[str, Any], dict[str, Any]]:
    fallback = build_rule_based_evaluation(resume_text, job_description)
    parsed = extract_json_object(raw_output)
    if not parsed:
        fallback["raw_output"] = raw_output
        return fallback, {
            "source": "rule_based_fallback",
            "parsed_json": False,
            "raw_output_included": bool(raw_output.strip()),
        }

    breakdown = parsed.get("breakdown")
    if not isinstance(breakdown, dict):
        breakdown = {}

    normalized_breakdown = {}
    for key, default_value in fallback["breakdown"].items():
        normalized_breakdown[key] = _coerce_breakdown_score(breakdown.get(key), default_value)

    overall_score = parsed.get("overall_score")
    if not isinstance(overall_score, int):
        overall_score = round((sum(normalized_breakdown.values()) / 25) * 100)
    overall_score = max(0, min(100, overall_score))

    normalized = {
        "overall_score": overall_score,
        "breakdown": normalized_breakdown,
        "missing_keywords": _coerce_string_list(parsed.get("missing_keywords")) or fallback["missing_keywords"],
        "quick_wins": _coerce_string_list(parsed.get("quick_wins")) or fallback["quick_wins"],
        "strengths": _coerce_string_list(parsed.get("strengths")) or fallback["strengths"],
        "summary": _coerce_string(parsed.get("summary")) or fallback["summary"],
        "recommendation": _coerce_string(parsed.get("recommendation")) or fallback["recommendation"],
    }

    if raw_output.strip() and not extract_json_object(raw_output.strip()) == parsed:
        normalized["raw_output"] = raw_output

    return normalized, {
        "source": "model_json",
        "parsed_json": True,
        "raw_output_included": "raw_output" in normalized,
    }


def _extract_keywords(text: str) -> set[str]:
    tokens = re.findall(r"\b[a-z][a-z0-9+#.\-/]{2,}\b", text.lower())
    return {token for token in tokens if token not in STOP_WORDS}


def _to_five_point(ratio: float) -> int:
    return max(1, min(5, round(ratio * 4) + 1))


def _coerce_breakdown_score(value: Any, default: int) -> int:
    if isinstance(value, bool):
        return default
    if isinstance(value, (int, float)):
        return max(1, min(5, round(float(value))))
    if isinstance(value, str):
        match = re.search(r"\d+(?:\.\d+)?", value)
        if match:
            return max(1, min(5, round(float(match.group(0)))))
    return default


def _coerce_string_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()]


def _coerce_string(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()
