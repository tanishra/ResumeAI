import re

from .agents import (
    ResumeAgent,
    build_ats_writer_agent,
    build_evaluator_agent,
    build_parser_agent,
    build_refiner_agent,
)
from .tasks import (
    ResumeTask,
    evaluate_ats_task,
    parse_resume_task,
    refine_bullets_task,
    rewrite_for_ats_task,
)


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


def _build_messages(agent: ResumeAgent, task: ResumeTask) -> list[dict[str, str]]:
    system_prompt = (
        f"Role: {agent.role}\n"
        f"Goal: {agent.goal}\n"
        f"Backstory: {agent.backstory}\n"
        f"Expected output: {task.expected_output}"
    )
    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": task.description},
    ]


def _invoke_task(agent: ResumeAgent, task: ResumeTask) -> str:
    return agent.llm.call(_build_messages(agent, task))


def _run_stage(
    agent: ResumeAgent,
    task: ResumeTask,
    fallback_text: str,
    *,
    sanitize_output=_sanitize_text_output,
) -> str:
    try:
        result = _invoke_task(agent, task)
        cleaned_result = sanitize_output(result)
        return cleaned_result or fallback_text
    except Exception:
        return fallback_text


def build_crew(raw_resume_text: str, job_title: str, job_description: str) -> dict[str, object]:
    parser = build_parser_agent()
    writer = build_ats_writer_agent()
    refiner = build_refiner_agent()
    evaluator = build_evaluator_agent()

    return {
        "agents": [parser, writer, refiner, evaluator],
        "tasks": [
            parse_resume_task(parser, raw_resume_text),
            rewrite_for_ats_task(writer, "{CLEANED_RESUME}", job_title, job_description),
            refine_bullets_task(refiner, "{REWRITTEN_RESUME}"),
            evaluate_ats_task(evaluator, "{FINAL_RESUME}", job_title, job_description),
        ],
    }


def run_pipeline(raw_resume_text: str, job_title: str, job_description: str):
    parser = build_parser_agent()
    writer = build_ats_writer_agent()
    refiner = build_refiner_agent()
    evaluator = build_evaluator_agent()

    cleaned = _run_stage(parser, parse_resume_task(parser, raw_resume_text), raw_resume_text)
    rewritten = _run_stage(
        writer,
        rewrite_for_ats_task(writer, cleaned, job_title, job_description),
        cleaned,
    )
    final_resume = _run_stage(refiner, refine_bullets_task(refiner, rewritten), rewritten)
    evaluation = _run_stage(
        evaluator,
        evaluate_ats_task(evaluator, final_resume, job_title, job_description),
        "",
        sanitize_output=_sanitize_evaluation_output,
    )

    return cleaned, rewritten, final_resume, evaluation
