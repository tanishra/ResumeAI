from unittest.mock import Mock, patch

from crew_app.crew import run_pipeline


def test_run_pipeline_sanitizes_stage_outputs():
    crew_instances = [
        Mock(kickoff=Mock(return_value="```text\nCLEANED RESUME\n- Built APIs\n```")),
        Mock(kickoff=Mock(return_value="Here is the rewritten resume:\nREWRITTEN RESUME\n- Built APIs with Python")),
        Mock(kickoff=Mock(return_value="```markdown\nFINAL RESUME\n- Built scalable APIs\n```")),
        Mock(
            kickoff=Mock(
                return_value=(
                    "ATS evaluation follows:\n"
                    '{\n  "overall_score": 82,\n  "breakdown": {"keyword_match": 4}\n}'
                )
            )
        ),
    ]

    with patch("crew_app.crew.build_parser_agent", return_value=object()), \
         patch("crew_app.crew.build_ats_writer_agent", return_value=object()), \
         patch("crew_app.crew.build_refiner_agent", return_value=object()), \
         patch("crew_app.crew.build_evaluator_agent", return_value=object()), \
         patch("crew_app.crew.parse_resume_task", return_value=object()), \
         patch("crew_app.crew.rewrite_for_ats_task", return_value=object()), \
         patch("crew_app.crew.refine_bullets_task", return_value=object()), \
         patch("crew_app.crew.evaluate_ats_task", return_value=object()), \
         patch("crew_app.crew.Crew", side_effect=crew_instances):
        cleaned, rewritten, final_resume, evaluation = run_pipeline(
            raw_resume_text="Raw resume text",
            job_title="Engineer",
            job_description="Build backend systems",
        )

    assert cleaned == "CLEANED RESUME\n- Built APIs"
    assert rewritten == "REWRITTEN RESUME\n- Built APIs with Python"
    assert final_resume == "FINAL RESUME\n- Built scalable APIs"
    assert evaluation == '{\n  "overall_score": 82,\n  "breakdown": {"keyword_match": 4}\n}'


def test_run_pipeline_falls_back_when_stage_fails():
    crew_instances = [
        Mock(kickoff=Mock(side_effect=RuntimeError("parse failed"))),
        Mock(kickoff=Mock(side_effect=RuntimeError("rewrite failed"))),
        Mock(kickoff=Mock(return_value="Refined resume text")),
        Mock(kickoff=Mock(side_effect=RuntimeError("evaluation failed"))),
    ]

    with patch("crew_app.crew.build_parser_agent", return_value=object()), \
         patch("crew_app.crew.build_ats_writer_agent", return_value=object()), \
         patch("crew_app.crew.build_refiner_agent", return_value=object()), \
         patch("crew_app.crew.build_evaluator_agent", return_value=object()), \
         patch("crew_app.crew.parse_resume_task", return_value=object()), \
         patch("crew_app.crew.rewrite_for_ats_task", return_value=object()), \
         patch("crew_app.crew.refine_bullets_task", return_value=object()), \
         patch("crew_app.crew.evaluate_ats_task", return_value=object()), \
         patch("crew_app.crew.Crew", side_effect=crew_instances):
        cleaned, rewritten, final_resume, evaluation = run_pipeline(
            raw_resume_text="Raw resume text",
            job_title="Engineer",
            job_description="Build backend systems",
        )

    assert cleaned == "Raw resume text"
    assert rewritten == "Raw resume text"
    assert final_resume == "Refined resume text"
    assert evaluation == ""
