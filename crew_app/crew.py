import os
import re
from crewai import Crew, Process
import sys
from .agents import (
    build_parser_agent, build_ats_writer_agent,
    build_evaluator_agent, build_refiner_agent
)
from .tasks import (
    parse_resume_task, rewrite_for_ats_task,
    evaluate_ats_task, refine_bullets_task
)

sys.path.append(os.path.dirname(os.path.abspath(__file__)))


def _sanitize_text_output(value: object) -> str:
    text = str(value).strip()
    if not text:
        return ""

    fenced_match = re.match(r"^```(?:[\w+-]+)?\s*(.*?)```$", text, flags=re.DOTALL)
    if fenced_match:
        text = fenced_match.group(1).strip()

    lines = [line.rstrip() for line in text.splitlines()]
    while lines and not lines[0].strip():
        lines.pop(0)

    # Crew/LLM runs sometimes prepend labels like "Here is the rewritten resume:"
    while lines and re.match(
        r"^(?:here(?:'s| is)\b|(?:rewritten|refined|cleaned) resume\s*:)\s*",
        lines[0].strip(),
        flags=re.IGNORECASE,
    ):
        lines.pop(0)

    return "\n".join(lines).strip()


def _sanitize_evaluation_output(value: object) -> str:
    text = _sanitize_text_output(value)
    if not text:
        return ""

    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start : end + 1].strip()

    return text


def _run_stage(agent, task, fallback_text: str, *, sanitize_output=_sanitize_text_output) -> str:
    try:
        crew = Crew(
            agents=[agent],
            tasks=[task],
            process=Process.sequential,
            verbose=False,
            tracing=False
        )
        result = crew.kickoff()
        cleaned_result = sanitize_output(result)
        return cleaned_result or fallback_text
    except Exception:
        return fallback_text

def build_crew(raw_resume_text: str, job_title: str, job_description: str):
    parser = build_parser_agent()
    writer = build_ats_writer_agent()
    refiner = build_refiner_agent()
    evaluator = build_evaluator_agent()

    t_parse = parse_resume_task(parser, raw_resume_text)
    # these are placeholders; we'll stitch later after parse result is known
    t_rewrite = rewrite_for_ats_task(writer, "{CLEANED_RESUME}", job_title, job_description)
    t_refine = refine_bullets_task(refiner, "{REWRITTEN_RESUME}")
    t_eval = evaluate_ats_task(evaluator, "{FINAL_RESUME}", job_title, job_description)

    crew = Crew(
        agents=[parser, writer, refiner, evaluator],
        tasks=[t_parse, t_rewrite, t_refine, t_eval],
        process=Process.sequential,
        verbose=True,
        tracing=False
    )
    return crew

def run_pipeline(raw_resume_text: str, job_title: str, job_description: str):
    # Build agents
    parser = build_parser_agent()
    writer = build_ats_writer_agent()
    refiner = build_refiner_agent()
    evaluator = build_evaluator_agent()

    # Create tasks
    t_parse = parse_resume_task(parser, raw_resume_text)

    cleaned = _run_stage(parser, t_parse, raw_resume_text)

    # Create rewrite task with cleaned resume
    t_rewrite = rewrite_for_ats_task(writer, cleaned, job_title, job_description)
    rewritten = _run_stage(writer, t_rewrite, cleaned)

    # Create refine task with rewritten resume
    t_refine = refine_bullets_task(refiner, rewritten)
    final_resume = _run_stage(refiner, t_refine, rewritten)

    # Create evaluation task with final resume
    t_eval = evaluate_ats_task(evaluator, final_resume, job_title, job_description)
    evaluation = _run_stage(
        evaluator,
        t_eval,
        "",
        sanitize_output=_sanitize_evaluation_output,
    )

    return cleaned, rewritten, final_resume, evaluation
