import json
import asyncio
import logging
from fastapi import APIRouter, UploadFile, Form, HTTPException, Response
from fastapi.responses import JSONResponse, StreamingResponse
from sse_starlette.sse import EventSourceResponse
from backend.app.services.analyzer import analyze_resume
from backend.app.services.errors import ResumeAnalyzerError
from crew_app.utils import txt_to_docx_bytes
from backend.app.services.pdf_renderer import render_resume_pdf_bytes

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/resume", tags=["Resume"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024


def _validate_request(file: UploadFile, contents: bytes, job_title: str, job_description: str) -> None:
    filename = (file.filename or "").lower()
    extension = f".{filename.rsplit('.', 1)[-1]}" if "." in filename else ""

    if extension not in ALLOWED_EXTENSIONS:
        logger.warning(f"Rejected upload with unsupported extension: {extension}")
        raise HTTPException(status_code=400, detail="Unsupported file type. Use PDF, DOCX, or TXT.")

    if len(contents) > MAX_FILE_SIZE_BYTES:
        logger.warning(f"Rejected upload exceeding size limit: {len(contents)} bytes")
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
    logger.info(f"Analysis request received for file: {file.filename}, job: {job_title}")
    contents = await file.read()
    _validate_request(file, contents, job_title, job_description)
    
    async def event_generator():
        queue = asyncio.Queue()

        async def on_progress(message: str):
            logger.info(f"Progress update: {message}")
            await queue.put({"type": "progress", "message": message})

        async def run_analysis():
            try:
                results = await analyze_resume(file.filename, contents, job_title, job_description, on_progress=on_progress)
                await queue.put({"type": "results", "data": results})
                logger.info("Analysis successfully completed")
            except ResumeAnalyzerError as exc:
                logger.error(f"ResumeAnalyzerError: {exc.detail} (code: {exc.error_code})")
                await queue.put({"type": "error", "detail": exc.detail, "code": exc.error_code})
            except Exception as exc:
                logger.exception("Unexpected error during resume analysis pipeline")
                await queue.put({"type": "error", "detail": str(exc), "code": "unexpected_error"})
            finally:
                await queue.put(None)

        task = asyncio.create_task(run_analysis())

        while True:
            item = await queue.get()
            if item is None:
                break
            yield {"data": json.dumps(item)}
        
        await task

    return EventSourceResponse(event_generator())

@router.post("/download-docx")
async def download_docx(
    final_resume: str = Form(...),
):
    logger.info("DOCX download requested")
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
    except Exception:
        logger.exception("Error generating DOCX document")
        raise HTTPException(
            status_code=500,
            detail="The resume document could not be generated.",
            headers={"X-Error-Code": "docx_generation_error"},
        )

@router.post("/download-pdf")
async def download_pdf(
    final_resume: str = Form(...),
):
    logger.info("PDF download requested")
    try:
        if not final_resume.strip():
            raise HTTPException(status_code=400, detail="Final resume content is required.")

        pdf_bytes = render_resume_pdf_bytes(final_resume.strip())
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=optimized_resume.pdf"}
        )
    except HTTPException:
        raise
    except ValueError as exc:
        logger.exception("Error generating PDF document")
        raise HTTPException(
            status_code=500,
            detail=str(exc),
            headers={"X-Error-Code": "pdf_generation_error"},
        )
    except Exception:
        logger.exception("Error generating PDF document")
        raise HTTPException(
            status_code=500,
            detail="The PDF document could not be generated.",
            headers={"X-Error-Code": "pdf_generation_error"},
        )
