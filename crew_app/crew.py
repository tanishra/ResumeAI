import re
from dataclasses import asdict, dataclass

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


@dataclass(frozen=True)
class StageDiagnostics:
    stage: str
    succeeded: bool
    used_fallback: bool
    fallback_reason: str | None = None
    error_type: str | None = None
    error_message: str | None = None


def _run_stage(
    stage: str,
    agent: ResumeAgent,
    task: ResumeTask,
    fallback_text: str,
    *,
    sanitize_output=_sanitize_text_output,
) -> tuple[str, StageDiagnostics]:
    try:
        result = _invoke_task(agent, task)
        cleaned_result = sanitize_output(result)
        if cleaned_result:
            return cleaned_result, StageDiagnostics(
                stage=stage,
                succeeded=True,
                used_fallback=False,
            )

        return fallback_text, StageDiagnostics(
            stage=stage,
            succeeded=False,
            used_fallback=True,
            fallback_reason="empty_output",
        )
    except Exception as exc:
        return fallback_text, StageDiagnostics(
            stage=stage,
            succeeded=False,
            used_fallback=True,
            fallback_reason="exception",
            error_type=exc.__class__.__name__,
            error_message=str(exc).strip() or None,
        )


def run_pipeline(raw_resume_text: str, job_title: str, job_description: str):
    pipeline_results = run_pipeline_with_diagnostics(
        raw_resume_text=raw_resume_text,
        job_title=job_title,
        job_description=job_description,
    )
    return (
        pipeline_results["cleaned"],
        pipeline_results["rewritten"],
        pipeline_results["final_resume"],
        pipeline_results["evaluation"],
    )


def run_pipeline_with_diagnostics(raw_resume_text: str, job_title: str, job_description: str):
    parser = build_parser_agent()
    writer = build_ats_writer_agent()
    refiner = build_refiner_agent()
    evaluator = build_evaluator_agent()

    cleaned, parse_diagnostics = _run_stage(
        "parse",
        parser,
        parse_resume_task(parser, raw_resume_text),
        raw_resume_text,
    )
    rewritten, rewrite_diagnostics = _run_stage(
        "rewrite",
        writer,
        rewrite_for_ats_task(writer, cleaned, job_title, job_description),
        cleaned,
    )
    final_resume, refine_diagnostics = _run_stage(
        "refine",
        refiner,
        refine_bullets_task(refiner, rewritten),
        rewritten,
    )
    evaluation, evaluation_diagnostics = _run_stage(
        "evaluation",
        evaluator,
        evaluate_ats_task(evaluator, final_resume, job_title, job_description),
        "",
        sanitize_output=_sanitize_evaluation_output,
    )

    return {
        "cleaned": cleaned,
        "rewritten": rewritten,
        "final_resume": final_resume,
        "evaluation": evaluation,
        "diagnostics": {
            "stages": [
                asdict(parse_diagnostics),
                asdict(rewrite_diagnostics),
                asdict(refine_diagnostics),
                asdict(evaluation_diagnostics),
            ]
        },
    }


def repair_rewrite(
    cleaned_resume_text: str,
    previous_candidate: str,
    validation_issues: list[dict[str, object]],
    job_title: str,
    job_description: str,
) -> str:
    writer = build_ats_writer_agent()
    repaired_text, _ = _run_stage(
        "rewrite_repair",
        writer,
        rewrite_for_ats_task(
            writer,
            cleaned_resume_text,
            job_title,
            job_description,
            previous_candidate=previous_candidate,
            grounding_issues=validation_issues,
        ),
        previous_candidate,
    )
    return repaired_text


def repair_final_resume(
    source_resume_text: str,
    rewritten_resume_text: str,
    previous_candidate: str,
    validation_issues: list[dict[str, object]],
) -> str:
    refiner = build_refiner_agent()
    repaired_text, _ = _run_stage(
        "final_resume_repair",
        refiner,
        refine_bullets_task(
            refiner,
            rewritten_resume_text,
            source_resume_text=source_resume_text,
            previous_candidate=previous_candidate,
            grounding_issues=validation_issues,
        ),
        previous_candidate,
    )
    return repaired_text
