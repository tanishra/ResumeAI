import json
import asyncio
import logging
import filetype
import hashlib
from fastapi import APIRouter, UploadFile, Form, HTTPException, Response, Request
from fastapi.responses import JSONResponse, StreamingResponse
from sse_starlette.sse import EventSourceResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from diskcache import Cache

from backend.app.services.analyzer import analyze_resume
from backend.app.services.errors import ResumeAnalyzerError
from backend.app.services.pdf_renderer import render_resume_docx_bytes, render_resume_pdf_bytes

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/resume", tags=["Resume"])
limiter = Limiter(key_func=get_remote_address)
cache = Cache(".cache/resume_analysis")

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
}
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

    # Validate file content signature
    if extension != ".txt":
        kind = filetype.guess(contents)
        if kind is None or kind.mime not in ALLOWED_MIME_TYPES:
            logger.warning("Rejected upload with invalid file signature")
            raise HTTPException(status_code=400, detail="Invalid file signature. File may be corrupted or disguised.")

    if not job_title.strip():
        raise HTTPException(status_code=400, detail="Job title is required.")

    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description is required.")


def _parse_structured_resume_payload(payload: str | None) -> dict | None:
    if not payload or not payload.strip():
        return None

    try:
        parsed = json.loads(payload)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="structured_resume_json must be valid JSON.") from exc

    if not isinstance(parsed, dict):
        raise HTTPException(status_code=400, detail="structured_resume_json must be a JSON object.")

    return parsed

@router.post("/analyze")
@limiter.limit("5/minute")
async def analyze(
    request: Request,
    file: UploadFile,
    job_title: str = Form(...),
    job_description: str = Form(...)
):
    logger.info(f"Analysis request received for file: {file.filename}, job: {job_title}")
    contents = await file.read()
    _validate_request(file, contents, job_title, job_description)
    
    # Generate cache key
    file_hash = hashlib.sha256(contents).hexdigest()
    job_hash = hashlib.sha256(f"{job_title}:{job_description}".encode("utf-8")).hexdigest()
    cache_key = f"{file_hash}_{job_hash}"

    async def event_generator():
        queue = asyncio.Queue()

        async def on_progress(message: str):
            logger.info(f"Progress update: {message}")
            await queue.put({"type": "progress", "message": message})

        async def run_analysis():
            try:
                if cache_key in cache:
                    logger.info("Returning cached analysis results")
                    await on_progress("Found cached analysis. Returning results instantly.")
                    await queue.put({"type": "results", "data": cache[cache_key]})
                else:
                    results = await analyze_resume(file.filename, contents, job_title, job_description, on_progress=on_progress)
                    cache.set(cache_key, results, expire=86400) # Cache for 24 hours
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

        def custom_encoder(obj):
            if isinstance(obj, bytes):
                return obj.decode("utf-8", errors="replace")
            raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")

        while True:
            item = await queue.get()
            if item is None:
                break
            yield {"data": json.dumps(item, default=custom_encoder)}
        
        await task

    return EventSourceResponse(event_generator())

@router.post("/download-docx")
async def download_docx(
    final_resume: str = Form(...),
    structured_resume_json: str | None = Form(None),
):
    logger.info("DOCX download requested")
    try:
        if not final_resume.strip():
            raise HTTPException(status_code=400, detail="Final resume content is required.")

        structured_resume = _parse_structured_resume_payload(structured_resume_json)

        return StreamingResponse(
            iter([render_resume_docx_bytes(final_resume.strip(), structured_resume=structured_resume)]),
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
    structured_resume_json: str | None = Form(None),
):
    logger.info("PDF download requested")
    try:
        if not final_resume.strip():
            raise HTTPException(status_code=400, detail="Final resume content is required.")

        structured_resume = _parse_structured_resume_payload(structured_resume_json)

        pdf_bytes = render_resume_pdf_bytes(final_resume.strip(), structured_resume=structured_resume)
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
