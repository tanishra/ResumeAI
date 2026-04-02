import re
from typing import Any


COMMON_TOOLS = {
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "python",
    "java", "javascript", "typescript", "react", "next.js", "nextjs",
    "node.js", "nodejs", "fastapi", "django", "flask", "sql", "mysql",
    "postgresql", "mongodb", "redis", "airflow", "spark", "pandas", "numpy",
    "scikit-learn", "tensorflow", "pytorch", "tableau", "power bi", "snowflake",
    "git", "github", "gitlab", "linux", "jenkins", "ci/cd",
}

DATE_PATTERNS = (
    r"\b(?:19|20)\d{2}\b",
    r"\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(?:19|20)\d{2}\b",
    r"\b(?:19|20)\d{2}\s*[-/]\s*(?:present|current|(?:19|20)\d{2})\b",
)

METRIC_PATTERNS = (
    r"\b\d+(?:\.\d+)?%",
    r"\b\d+(?:\.\d+)?x\b",
    r"\b\d+(?:\.\d+)?\+\b",
    r"\b\d+(?:,\d{3})+(?:\.\d+)?\b",
    r"\b\d+(?:\.\d+)?\s*(?:years?|months?|users?|customers?|clients?|projects?|people|engineers?)\b",
    r"\b(?:\$|usd\s*)\d+(?:,\d{3})*(?:\.\d+)?\b",
)

CREDENTIAL_PATTERNS = (
    r"\b(?:bachelor|master|phd|doctorate|b\.?tech|m\.?tech|b\.?e\.?|m\.?e\.?|mba|bsc|msc|bs|ms)\b[^,\n]{0,60}",
    r"\b(?:certified|certification|certificate|licensed)\b[^,\n]{0,80}",
)

ORG_PATTERNS = (
    r"\b[A-Z][A-Za-z0-9&.,'-]*(?:\s+[A-Z][A-Za-z0-9&.,'-]*){0,4}\s+(?:Inc|LLC|Ltd|Limited|Corp|Corporation|Technologies|Technology|Systems|Solutions|Labs|University|College)\b",
)


def validate_resume_grounding(source_text: str, candidate_text: str) -> dict[str, Any]:
    source_normalized = _normalize_text(source_text)
    candidate_normalized = _normalize_text(candidate_text)

    issues: list[dict[str, Any]] = []

    unsupported_dates = _find_unsupported_matches(source_normalized, candidate_normalized, DATE_PATTERNS)
    unsupported_metrics = _find_unsupported_matches(source_normalized, candidate_normalized, METRIC_PATTERNS)
    unsupported_credentials = _find_unsupported_matches(source_normalized, candidate_normalized, CREDENTIAL_PATTERNS)
    unsupported_organizations = _find_unsupported_matches(source_normalized, candidate_normalized, ORG_PATTERNS)
    unsupported_tools = sorted(_extract_tools(candidate_normalized) - _extract_tools(source_normalized))

    if unsupported_dates:
        issues.append({"type": "dates", "items": unsupported_dates[:5]})
    if unsupported_metrics:
        issues.append({"type": "metrics", "items": unsupported_metrics[:5]})
    if unsupported_credentials:
        issues.append({"type": "credentials", "items": unsupported_credentials[:5]})
    if unsupported_organizations:
        issues.append({"type": "organizations", "items": unsupported_organizations[:5]})
    if unsupported_tools:
        issues.append({"type": "tools", "items": unsupported_tools[:8]})

    return {
        "passed": len(issues) == 0,
        "issues": issues,
    }


def enforce_resume_grounding(
    *,
    source_text: str,
    candidate_text: str,
    fallback_text: str,
    stage: str,
) -> tuple[str, dict[str, Any]]:
    validation = validate_resume_grounding(source_text, candidate_text)

    if validation["passed"]:
        return candidate_text, {
            "stage": stage,
            "passed": True,
            "used_fallback": False,
            "issues": [],
        }

    return fallback_text, {
        "stage": stage,
        "passed": False,
        "used_fallback": True,
        "issues": validation["issues"],
    }


def _normalize_text(text: str) -> str:
    return text.replace("\u2022", "-").strip()


def _find_unsupported_matches(source_text: str, candidate_text: str, patterns: tuple[str, ...]) -> list[str]:
    source_matches: set[str] = set()
    candidate_matches: set[str] = set()

    for pattern in patterns:
        source_matches.update(_normalize_match(match) for match in re.findall(pattern, source_text, flags=re.IGNORECASE))
        candidate_matches.update(_normalize_match(match) for match in re.findall(pattern, candidate_text, flags=re.IGNORECASE))

    return sorted(match for match in candidate_matches if match and match not in source_matches)


def _extract_tools(text: str) -> set[str]:
    lowered = text.lower()
    found = set()
    for tool in COMMON_TOOLS:
        if re.search(rf"(?<!\w){re.escape(tool)}(?!\w)", lowered):
            found.add(tool)
    return found


def _normalize_match(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip()).lower()
