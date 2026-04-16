from unittest.mock import patch

from backend.app.services.pdf_renderer import (
    parse_resume_text,
    render_resume_html,
    render_resume_docx_bytes,
    render_resume_pdf_bytes,
    structured_resume_from_text,
)


def test_parse_resume_text_maps_sections_and_header_fields():
    resume_text = """JANE DOE
San Francisco, CA
+1 555 123 4567 | jane@example.com | https://github.com/janedoe | https://linkedin.com/in/janedoe

SUMMARY
Backend engineer building reliable APIs.

EXPERIENCE
Senior Software Engineer at Acme Corp | 2022 - Present
Remote, USA
- Built FastAPI services for internal tooling.
- Reduced incident volume through automation.

PROJECTS
ResumeAI | Next.js, FastAPI, OpenAI | 2025
- Built an ATS optimization product.

TECHNICAL SKILLS
Languages: Python, TypeScript
Frameworks: FastAPI, Next.js
"""

    parsed = parse_resume_text(resume_text)

    assert parsed.name == "JANE DOE"
    assert parsed.location == "San Francisco, CA"
    assert parsed.phone == "+1 555 123 4567"
    assert parsed.email == "jane@example.com"
    assert parsed.links[0][0] == "GitHub"
    assert parsed.summary == ["Backend engineer building reliable APIs."]
    assert parsed.experience[0].title == "Acme Corp"
    assert parsed.experience[0].subtitle == "Senior Software Engineer"
    assert parsed.experience[0].date == "2022 - Present"
    assert parsed.projects[0].title == "ResumeAI"
    assert parsed.projects[0].subtitle == "Next.js, FastAPI, OpenAI"


def test_render_resume_html_includes_template_sections():
    resume_text = """JANE DOE
Austin, TX
jane@example.com | https://github.com/janedoe

EDUCATION
State University | 2020 - 2024
B.S. Computer Science | Austin, TX

EXPERIENCE
Software Engineer at Acme | 2024 - Present
Austin, TX
- Built APIs.

TECHNICAL SKILLS
Languages: Python, JavaScript
"""

    html = render_resume_html(resume_text)

    assert "JANE DOE" in html
    assert "<h2>Education</h2>" in html
    assert "<h2>Experience</h2>" in html
    assert "<h2>Technical Skills</h2>" in html
    assert "Software Engineer" in html


def test_render_resume_html_handles_markdown_style_headings():
    resume_text = """JANE DOE
Austin, TX
+1 555 111 2222 | jane@example.com | https://github.com/janedoe

## Professional Summary
Backend engineer focused on APIs and platform reliability.

## Work Experience
Senior Software Engineer at Acme | 2024 - Present
Austin, TX
- Built FastAPI services.
- Reduced operational toil.

## Technical Skills
Languages: Python, TypeScript
Frameworks: FastAPI, Next.js
"""

    html = render_resume_html(resume_text)

    assert "<h2>Summary</h2>" in html
    assert "<h2>Experience</h2>" in html
    assert "<h2>Technical Skills</h2>" in html
    assert "Built FastAPI services." in html


def test_render_resume_html_strips_markdown_artifacts():
    resume_text = """JANE DOE
Austin, TX
jane@example.com

## **Professional Summary**
Built **reliable** APIs with `Python`.

## **Technical Skills**
Languages: **Python**, TypeScript
"""

    html = render_resume_html(resume_text)

    assert "**" not in html
    assert "`Python`" not in html
    assert "reliable" in html
    assert "Python" in html


def test_render_resume_pdf_bytes_returns_real_pdf():
    resume_text = """JANE DOE
Austin, TX
jane@example.com | https://github.com/janedoe

SUMMARY
Backend engineer focused on APIs and platform reliability.
"""

    pdf_bytes = render_resume_pdf_bytes(resume_text)

    assert pdf_bytes.startswith(b"%PDF")


def test_structured_resume_from_text_returns_serializable_schema():
    resume_text = """JANE DOE
Austin, TX
jane@example.com

SUMMARY
Backend engineer focused on APIs.
"""

    structured = structured_resume_from_text(resume_text)

    assert structured["name"] == "JANE DOE"
    assert structured["summary"] == ["Backend engineer focused on APIs."]


def test_render_resume_docx_bytes_returns_real_docx():
    resume_text = """JANE DOE
Austin, TX
jane@example.com

SUMMARY
Backend engineer focused on APIs.
"""

    docx_bytes = render_resume_docx_bytes(resume_text)

    assert docx_bytes[:2] == b"PK"


def test_download_pdf_route_uses_pdf_renderer():
    from backend.app.main import app
    from fastapi.testclient import TestClient

    client = TestClient(app)

    with patch("backend.app.routers.resume.render_resume_pdf_bytes", return_value=b"%PDF-1.4 fake pdf"):
        response = client.post(
            "/resume/download-pdf",
            data={"final_resume": "JANE DOE\nEXPERIENCE\n- Built APIs."},
        )

    assert response.status_code == 200
    assert response.content == b"%PDF-1.4 fake pdf"
    assert response.headers["content-type"] == "application/pdf"
    assert response.headers["content-disposition"] == "attachment; filename=optimized_resume.pdf"


def test_download_pdf_route_returns_renderer_errors():
    from backend.app.main import app
    from fastapi.testclient import TestClient

    client = TestClient(app)

    with patch(
        "backend.app.routers.resume.render_resume_pdf_bytes",
        side_effect=ValueError("PDF rendering failed."),
    ):
        response = client.post(
            "/resume/download-pdf",
            data={"final_resume": "JANE DOE\nEXPERIENCE\n- Built APIs."},
        )

    assert response.status_code == 500
    assert response.json()["detail"] == "PDF rendering failed."
    assert response.headers["x-error-code"] == "pdf_generation_error"
