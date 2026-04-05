from crew_app.file_tools.file_loader import detect_and_extract
from crew_app.utils import txt_to_docx_bytes
from backend.app.services.evaluation import normalize_evaluation_payload
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

def analyze_resume(file_name: str, file_bytes: bytes, job_title: str, job_desc: str):
    """
    Runs the pipeline on an uploaded resume file.
    """
    from crew_app.crew import repair_final_resume, repair_rewrite, run_pipeline

    ext, raw_text = detect_and_extract(file_name, file_bytes)
    if not raw_text.strip():
        raise ValueError("No text could be extracted from the resume file.")

    cleaned, rewritten, final_resume, evaluation = run_pipeline(
        raw_resume_text=raw_text,
        job_title=job_title.strip(),
        job_description=job_desc.strip()
    )

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

    parsed_eval = normalize_evaluation_payload(
        raw_output=evaluation,
        resume_text=validated_final_resume,
        job_description=job_desc.strip(),
    )

    return {
        "cleaned": cleaned,
        "rewritten": validated_rewritten,
        "final_resume": validated_final_resume,
        "evaluation": parsed_eval,
        "validation": {
            "rewrite": rewrite_validation,
            "final_resume": final_validation,
        },
        "docx_bytes": txt_to_docx_bytes(validated_final_resume),
    }
