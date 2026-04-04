from fastapi import APIRouter, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from backend.app.services.analyzer import analyze_resume
from crew_app.utils import txt_to_docx_bytes

router = APIRouter(prefix="/resume", tags=["Resume"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024


def _validate_request(file: UploadFile, contents: bytes, job_title: str, job_description: str) -> None:
    filename = (file.filename or "").lower()
    extension = f".{filename.rsplit('.', 1)[-1]}" if "." in filename else ""

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type. Use PDF, DOCX, or TXT.")

    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File size exceeds the 10MB limit.")

    if not job_title.strip():
        raise HTTPException(status_code=400, detail="Job title is required.")

    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description is required.")

@router.post("/analyze")
async def analyze(
    file: UploadFile,
    job_title: str = Form(...),
    job_description: str = Form(...)
):
    try:
        contents = await file.read()
        _validate_request(file, contents, job_title, job_description)
        results = analyze_resume(file.filename, contents, job_title, job_description)
        return JSONResponse(
            content={
                "success": True,
                "results": {
                    "cleaned": results["cleaned"],
                    "rewritten": results["rewritten"],
                    "final_resume": results["final_resume"],
                    "evaluation": results["evaluation"],
                    "validation": results["validation"],
                }
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/download-docx")
async def download_docx(
    final_resume: str = Form(...),
):
    try:
        if not final_resume.strip():
            raise HTTPException(status_code=400, detail="Final resume content is required.")

        return StreamingResponse(
            iter([txt_to_docx_bytes(final_resume.strip())]),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": "attachment; filename=final_resume.docx"}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
