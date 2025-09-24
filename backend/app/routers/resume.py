from fastapi import APIRouter, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from backend.app.services.analyzer import analyze_resume

router = APIRouter(prefix="/resume", tags=["Resume"])

@router.post("/analyze")
async def analyze(
    file: UploadFile,
    job_title: str = Form(...),
    job_description: str = Form(...)
):
    try:
        contents = await file.read()
        results = analyze_resume(file.filename, contents, job_title, job_description)
        return JSONResponse(
            content={
                "success": True,
                "results": {
                    "cleaned": results["cleaned"],
                    "rewritten": results["rewritten"],
                    "final_resume": results["final_resume"],
                    "evaluation": results["evaluation"],
                }
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/download-docx")
async def download_docx(
    file: UploadFile,
    job_title: str = Form(...),
    job_description: str = Form(...)
):
    try:
        contents = await file.read()
        results = analyze_resume(file.filename, contents, job_title, job_description)

        return StreamingResponse(
            iter([results["docx_bytes"]]),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": "attachment; filename=final_resume.docx"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
