import json
from crew_app.file_tools.file_loader import detect_and_extract
from crew_app.crew import run_pipeline
from crew_app.utils import txt_to_docx_bytes

def analyze_resume(file_name: str, file_bytes: bytes, job_title: str, job_desc: str):
    """
    Runs the pipeline on an uploaded resume file.
    """
    ext, raw_text = detect_and_extract(file_name, file_bytes)
    if not raw_text.strip():
        raise ValueError("No text could be extracted from the resume file.")

    cleaned, rewritten, final_resume, evaluation = run_pipeline(
        raw_resume_text=raw_text,
        job_title=job_title.strip(),
        job_description=job_desc.strip()
    )

    # Try to parse evaluation JSON
    parsed_eval = None
    try:
        fixed = evaluation.strip().replace("'", '"')
        parsed_eval = json.loads(fixed)
    except Exception:
        parsed_eval = {"raw_output": evaluation}

    return {
        "cleaned": cleaned,
        "rewritten": rewritten,
        "final_resume": final_resume,
        "evaluation": parsed_eval,
        "docx_bytes": txt_to_docx_bytes(final_resume),
    }
