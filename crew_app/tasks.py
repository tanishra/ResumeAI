from crewai import Task

def parse_resume_task(agent, raw_resume_text):
    return Task(
        description=(
            f"Clean this resume text quickly:\n\n{raw_resume_text}\n\n"
            "Remove artifacts, normalize bullets to '-', keep all content. Be fast and direct."
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
            "Match keywords, use action verbs, add metrics. Target 80+ ATS score. Be direct and fast."
        ),
        agent=agent,
        expected_output="ATS-optimized resume with keyword placement and metrics."
    )

def refine_bullets_task(agent, rewritten_resume_text):
    return Task(
        description=(
            f"Polish these bullets with action verbs and metrics:\n\n{rewritten_resume_text}\n\n"
            "Add strong verbs and numbers. Be fast and direct."
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
            "Rate 1-5: keywords, structure, metrics, verbs, format. Return JSON with overall_score (0-100), breakdown, missing_keywords, quick_wins."
        ),
        agent=agent,
        expected_output="JSON evaluation with scores and recommendations."
    )
