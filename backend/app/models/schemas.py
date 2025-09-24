from pydantic import BaseModel
from typing import Optional, Dict

class ResumeRequest(BaseModel):
    job_title: str
    job_description: str

class ResumeResponse(BaseModel):
    cleaned: str
    rewritten: str
    final_resume: str
    evaluation: Dict
