<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,50:1d4ed8,100:312e81&height=220&section=header&text=ResumeAI&fontSize=72&fontColor=FFFFFF&fontAlignY=40&desc=ATS%20Resume%20Optimization%20with%20Next.js%2C%20FastAPI%20and%20CrewAI&descAlignY=63&descColor=ffffff&descSize=18" width="100%"/>

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-15-111827?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-API-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![LangChain](https://img.shields.io/badge/LangChain-ChatOpenAI-1C3C3C?style=for-the-badge)](https://www.langchain.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Frontend-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-Backend-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)

<br/>

> **Upload a resume, paste a target job description, and generate a stronger ATS-ready version automatically.**
> **ResumeAI extracts content, runs a staged OpenAI-powered optimization pipeline, validates grounding, and returns scoring feedback with downloadable output.**

<br/>

</div>

## What It Does

- Accepts `pdf`, `docx`, and `txt` resumes
- Extracts resume text on the backend
- Runs a staged LLM pipeline for cleanup, ATS rewrite, refinement, and evaluation
- Validates rewritten output against the source resume and falls back when unsupported claims are introduced
- Returns downloadable output, grounded resume text, and scoring feedback in the frontend

## How It Actually Works

ResumeAI currently has two interfaces in the repo:

- `frontend/` + `backend/` is the main app path
- `app.py` is an older Streamlit prototype that still uses the same core pipeline

The active backend flow is:

1. Upload file to FastAPI
2. Extract text from PDF, DOCX, or TXT
3. Run four sequential LLM stages:
   - parsing/cleanup
   - ATS rewrite
   - bullet refinement
   - evaluation
4. Validate rewritten output against the source resume to catch unsupported dates, metrics, tools, organizations, and credentials
5. Retry with repair prompts when needed, then fall back to the last grounded version if repair still fails
6. Normalize evaluation output to JSON, with a rule-based fallback when the model response is malformed

This is a staged pipeline, not a tool-using multi-agent CrewAI runtime.

## Run Locally

### Backend

```bash
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload
```

Create a root `.env` file:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

Run backend tests:

```bash
env UV_CACHE_DIR=/tmp/uv-cache uv run python backend/run_tests.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run frontend tests:

```bash
npm --prefix frontend test
```

## Project Structure

- `frontend/` Next.js interface
- `backend/` FastAPI API layer
- `crew_app/` staged LLM pipeline, prompts, and file utilities
- `app.py` legacy Streamlit interface

## Main API

`POST /resume/analyze`

Form fields:
- `file`
- `job_title`
- `job_description`

### Runtime Notes
- Defaults to `gpt-4o-mini` unless `OPENAI_MODEL` is overridden
- Uses sequential stage execution to keep prompts focused and isolate failures
- Adds grounding validation and evaluation normalization to reduce unsafe or malformed output

---

## User Interface

<img src="./assets/output-1.png" alt="Dashboard" style="width:100%;"/>

<img src="./assets/output-2.png" alt="Resume-upload" style="width:100%;"/>

<img src="./assets/output-3.png" alt="Footer" style="width:100%;"/>

## 📊 Example Output

### Input Resume (Basic)
```
John Smith
Software Developer
- Worked on web applications
- Used Python and JavaScript
- Fixed bugs
```

### Output Resume (ATS-Optimized)
```
JOHN SMITH
Senior Python Developer

PROFESSIONAL SUMMARY
Results-driven Python Developer with 5+ years experience in scalable web applications...

TECHNICAL SKILLS
- Programming: Python, JavaScript, Django, Flask
- Databases: PostgreSQL, MySQL, Redis
- Cloud: AWS, Docker, CI/CD pipelines

PROFESSIONAL EXPERIENCE
Senior Software Developer | TechCorp | 2020-Present
• Architected 5+ high-performance Python applications serving 50,000+ users
• Optimized database queries, improving response time by 30%
• Led cross-functional teams delivering 3 major releases ahead of schedule
```

### ATS Evaluation
```json
{
  "overall_score": 87,
  "breakdown": {
    "sections_coverage": 5,
    "keyword_match": 4,
    "measurable_impact": 5,
    "readability": 4,
    "formatting_simplicity": 5
  },
  "missing_keywords": ["machine learning", "API development"],
  "quick_wins": ["Add ML experience if applicable", "Include API projects"],
  "summary": "Strong ATS-optimized resume with excellent metrics..."
}
```

---

## Troubleshooting

### Common Issues

**API Key Error**
```
AuthenticationError: Incorrect API key
```
**Solution:** Add valid OpenAI API key to `.env` file

**Test Runner Plugin Error**
```bash
TypeError: ForwardRef._evaluate() missing 1 required keyword-only argument: 'recursive_guard'
```
**Solution:** Use the repo-backed runner `env UV_CACHE_DIR=/tmp/uv-cache uv run python backend/run_tests.py`, which disables third-party pytest plugin autoload before importing pytest.

**File Upload Error**
```
Could not extract text from file
```
**Solution:** Ensure file is valid PDF/DOCX

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request
