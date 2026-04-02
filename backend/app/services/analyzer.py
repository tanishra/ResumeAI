from crew_app.file_tools.file_loader import detect_and_extract
from crew_app.utils import txt_to_docx_bytes
from backend.app.services.evaluation import normalize_evaluation_payload
from backend.app.services.validation import enforce_resume_grounding

def analyze_resume(file_name: str, file_bytes: bytes, job_title: str, job_desc: str):
    """
    Runs the pipeline on an uploaded resume file.
    """
    from crew_app.crew import run_pipeline

    ext, raw_text = detect_and_extract(file_name, file_bytes)
    if not raw_text.strip():
        raise ValueError("No text could be extracted from the resume file.")

    cleaned, rewritten, final_resume, evaluation = run_pipeline(
        raw_resume_text=raw_text,
        job_title=job_title.strip(),
        job_description=job_desc.strip()
    )

    validated_rewritten, rewrite_validation = enforce_resume_grounding(
        source_text=cleaned,
        candidate_text=rewritten,
        fallback_text=cleaned,
        stage="rewrite",
    )
    validated_final_resume, final_validation = enforce_resume_grounding(
        source_text=cleaned,
        candidate_text=final_resume,
        fallback_text=validated_rewritten,
        stage="final_resume",
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
