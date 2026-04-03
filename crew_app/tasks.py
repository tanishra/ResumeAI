from crewai import Task

def parse_resume_task(agent, raw_resume_text):
    return Task(
        description=(
            f"Clean this resume text:\n\n{raw_resume_text}\n\n"
            "Remove OCR/file artifacts, normalize bullets to '-', and preserve every factual detail. "
            "Do not invent, infer, or delete achievements, dates, employers, titles, education, skills, or metrics. "
            "Return only the cleaned resume text."
        ),
        agent=agent,
        expected_output=("Clean resume text with proper structure.")
    )

def rewrite_for_ats_task(agent, cleaned_resume_text, job_title, job_description):
    return Task(
        description=(
            f"Rewrite resume for {job_title}:\n\n"
            f"JOB: {job_description}\n\n"
            f"RESUME: {cleaned_resume_text}\n\n"
            "Rewrite the resume to improve ATS alignment using only facts already present in the resume. "
            "Preserve employer names, dates, titles, education, projects, skills, and metrics unless you are only reordering or rephrasing them. "
            "Do not invent employers, dates, projects, technologies, certifications, degrees, metrics, or outcomes. "
            "If the source resume lacks a metric, improve the wording without adding a number. "
            "Prefer conservative edits over aggressive rewriting. "
            "Return only the rewritten resume text with no code fences, intro, or commentary."
        ),
        agent=agent,
        expected_output="ATS-optimized resume with keyword placement and metrics."
    )

def refine_bullets_task(agent, rewritten_resume_text):
    return Task(
        description=(
            f"Refine this resume for clarity and impact:\n\n{rewritten_resume_text}\n\n"
            "Strengthen verbs, tighten phrasing, and improve readability while preserving factual accuracy. "
            "Do not add numbers, metrics, tools, achievements, or claims that are not already supported by the text. "
            "Keep the same overall sections and factual content. "
            "Return only the refined resume text with no code fences, intro, or commentary."
        ),
        agent=agent,
        expected_output="Resume with enhanced bullet points and metrics."
    )

def evaluate_ats_task(agent, final_resume_text, job_title, job_description):
    return Task(
        description=(
            f"Score this resume for {job_title}:\n\n"
            f"JOB: {job_description}\n\n"
            f"RESUME: {final_resume_text}\n\n"
            "Return JSON only. No prose before or after the JSON object.\n"
            "Use this exact schema:\n"
            "{\n"
            '  "overall_score": 0,\n'
            '  "breakdown": {\n'
            '    "keyword_match": 0,\n'
            '    "sections_coverage": 0,\n'
            '    "measurable_impact": 0,\n'
            '    "readability": 0,\n'
            '    "formatting_simplicity": 0\n'
            "  },\n"
            '  "missing_keywords": [],\n'
            '  "quick_wins": [],\n'
            '  "strengths": [],\n'
            '  "summary": "",\n'
            '  "recommendation": ""\n'
            "}\n"
            "Scores in breakdown must be integers from 1 to 5. overall_score must be 0 to 100. "
            "Base the evaluation only on evidence in the resume and job description."
        ),
        agent=agent,
        expected_output="JSON evaluation with scores and recommendations."
    )
