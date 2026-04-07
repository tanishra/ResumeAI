from time import perf_counter

from crew_app.file_tools.file_loader import detect_and_extract
from crew_app.utils import txt_to_docx_bytes
from backend.app.services.evaluation import normalize_evaluation_payload
from backend.app.services.errors import (
    AnalyzerConfigurationError,
    PipelineExecutionError,
    ResumeExtractionError,
    UpstreamModelError,
)
from backend.app.services.validation import validate_resume_grounding


def _apply_grounding_with_repair(
    *,
    source_text: str,
    candidate_text: str,
    fallback_text: str,
    stage: str,
    repair_fn,
) -> tuple[str, dict]:
    initial_validation = validate_resume_grounding(source_text, candidate_text)
    if initial_validation["passed"]:
        return candidate_text, {
            "stage": stage,
            "passed": True,
            "used_fallback": False,
            "repair_attempted": False,
            "repair_succeeded": False,
            "issues": [],
        }

    try:
        repaired_text = repair_fn(initial_validation["issues"])
    except Exception:
        repaired_text = candidate_text

    repaired_validation = validate_resume_grounding(source_text, repaired_text)
    if repaired_validation["passed"]:
        return repaired_text, {
            "stage": stage,
            "passed": True,
            "used_fallback": False,
            "repair_attempted": True,
            "repair_succeeded": True,
            "issues": [],
        }

    return fallback_text, {
        "stage": stage,
        "passed": False,
        "used_fallback": True,
        "repair_attempted": True,
        "repair_succeeded": False,
        "issues": repaired_validation["issues"],
        "initial_issues": initial_validation["issues"],
    }


def _classify_pipeline_exception(exc: Exception) -> Exception:
    message = str(exc).strip()
    exc_name = exc.__class__.__name__

    if "OPENAI_API_KEY" in message or "api key" in message.lower():
        return AnalyzerConfigurationError(
            "The analyzer is not configured correctly. Check OPENAI_API_KEY and model settings."
        )

    if exc_name in {
        "AuthenticationError",
        "APIConnectionError",
        "APITimeoutError",
        "RateLimitError",
        "InternalServerError",
        "APIStatusError",
    }:
        return UpstreamModelError(
            "The upstream AI service is unavailable or rejected the request. Please try again."
        )

    return PipelineExecutionError(
        f"The resume pipeline failed before completion: {message or exc_name}."
    )

def analyze_resume(file_name: str, file_bytes: bytes, job_title: str, job_desc: str):
    """
    Runs the pipeline on an uploaded resume file.
    """
    from crew_app.crew import (
        repair_final_resume,
        repair_rewrite,
        run_pipeline_with_diagnostics,
    )

    started_at = perf_counter()
    extraction_started_at = perf_counter()
    try:
        ext, raw_text = detect_and_extract(file_name, file_bytes)
    except Exception as exc:
        raise ResumeExtractionError("The uploaded file could not be read as PDF, DOCX, or TXT.") from exc
    extraction_ms = round((perf_counter() - extraction_started_at) * 1000, 2)

    if not raw_text.strip():
        raise ResumeExtractionError("No text could be extracted from the resume file.")

    pipeline_started_at = perf_counter()
    try:
        pipeline_results = run_pipeline_with_diagnostics(
            raw_resume_text=raw_text,
            job_title=job_title.strip(),
            job_description=job_desc.strip()
        )
        cleaned = pipeline_results["cleaned"]
        rewritten = pipeline_results["rewritten"]
        final_resume = pipeline_results["final_resume"]
        evaluation = pipeline_results["evaluation"]
    except Exception as exc:
        raise _classify_pipeline_exception(exc) from exc
    pipeline_ms = round((perf_counter() - pipeline_started_at) * 1000, 2)

    grounding_started_at = perf_counter()
    validated_rewritten, rewrite_validation = _apply_grounding_with_repair(
        source_text=cleaned,
        candidate_text=rewritten,
        fallback_text=cleaned,
        stage="rewrite",
        repair_fn=lambda issues: repair_rewrite(
            cleaned,
            rewritten,
            issues,
            job_title.strip(),
            job_desc.strip(),
        ),
    )
    validated_final_resume, final_validation = _apply_grounding_with_repair(
        source_text=cleaned,
        candidate_text=final_resume,
        fallback_text=validated_rewritten,
        stage="final_resume",
        repair_fn=lambda issues: repair_final_resume(
            cleaned,
            validated_rewritten,
            final_resume,
            issues,
        ),
    )
    grounding_ms = round((perf_counter() - grounding_started_at) * 1000, 2)

    evaluation_started_at = perf_counter()
    parsed_eval, evaluation_metadata = normalize_evaluation_payload(
        raw_output=evaluation,
        resume_text=validated_final_resume,
        job_description=job_desc.strip(),
    )
    evaluation_ms = round((perf_counter() - evaluation_started_at) * 1000, 2)

    docx_started_at = perf_counter()
    docx_bytes = txt_to_docx_bytes(validated_final_resume)
    docx_generation_ms = round((perf_counter() - docx_started_at) * 1000, 2)

    return {
        "cleaned": cleaned,
        "rewritten": validated_rewritten,
        "final_resume": validated_final_resume,
        "evaluation": parsed_eval,
        "validation": {
            "rewrite": rewrite_validation,
            "final_resume": final_validation,
        },
        "telemetry": {
            "file_type": ext,
            "timings_ms": {
                "extraction": extraction_ms,
                "pipeline": pipeline_ms,
                "grounding": grounding_ms,
                "evaluation_normalization": evaluation_ms,
                "docx_generation": docx_generation_ms,
                "total": round((perf_counter() - started_at) * 1000, 2),
            },
            "grounding": {
                "rewrite": {
                    "repair_attempted": rewrite_validation["repair_attempted"],
                    "repair_succeeded": rewrite_validation["repair_succeeded"],
                    "used_fallback": rewrite_validation["used_fallback"],
                },
                "final_resume": {
                    "repair_attempted": final_validation["repair_attempted"],
                    "repair_succeeded": final_validation["repair_succeeded"],
                    "used_fallback": final_validation["used_fallback"],
                },
            },
            "pipeline": pipeline_results["diagnostics"],
            "evaluation": evaluation_metadata,
        },
        "docx_bytes": docx_bytes,
    }
