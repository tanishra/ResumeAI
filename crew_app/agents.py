from crewai import Agent, LLM
from typing import Optional, Union, List, Dict, Any
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_KEY = os.getenv("EURI_API_KEY")
BASE_URL = os.getenv("EURI_API_BASE_URL", "https://api.euron.one/api/v1/euri")
MODEL = os.getenv("EURI_MODEL", "gpt-4.1-nano")

if not API_KEY:
    raise ValueError("EURI_API_KEY environment variable is required")

print(f"✓ Configuring Euri AI with base URL: {BASE_URL}")

# Test the endpoint connectivity first
try:
    import requests
    test_url = f"{BASE_URL}/chat/completions"
    test_response = requests.get(BASE_URL.replace('/api/v1/euri', ''), timeout=5)
    print(f"✓ Euri API domain is reachable (status: {test_response.status_code})")
except Exception as e:
    print(f"⚠ Endpoint test warning: {e}")

# Create LLM instances with the correct Euri AI configuration
parser_llm = LLM(
    model=MODEL,
    api_key=API_KEY,
    base_url=BASE_URL,
    temperature=0.0
)

writer_llm = LLM(
    model=MODEL,
    api_key=API_KEY,
    base_url=BASE_URL,
    temperature=0.3
)

evaluator_llm = LLM(
    model=MODEL,
    api_key=API_KEY,
    base_url=BASE_URL,
    temperature=0.0
)

refiner_llm = LLM(
    model=MODEL,
    api_key=API_KEY,
    base_url=BASE_URL,
    temperature=0.2
)

print("✓ All LLM instances configured with Euri AI")

def build_parser_agent():
    return Agent(
        role="Resume Parsing Specialist", 
        goal="Extract clean, structured text from a resume suitable for ATS optimization.",
        backstory=(
            "You efficiently clean resume text by removing artifacts and normalizing formatting. "
            "Focus on speed and accuracy - preserve all important content while removing noise."
        ),
        llm=parser_llm,
        max_iter=1,
        max_execution_time=120,
    )


def build_ats_writer_agent():
    return Agent(
        role="ATS Optimization Writer",
        goal="Create a high-scoring ATS-optimized resume that matches job requirements perfectly.",
        backstory=(
            "You are an expert at transforming resumes into ATS-friendly formats that score 80+ points. "
            "You strategically place keywords, use strong action verbs, and quantify all achievements. "
            "You work quickly and deliver results that pass ATS systems."
        ),
        llm=writer_llm,
        max_iter=1,
        max_execution_time=120
    )


def build_evaluator_agent():
    return Agent(
        role="ATS Evaluator",
        goal="Provide accurate ATS scores and actionable improvement recommendations.",
        backstory=(
            "You are a precise ATS scoring expert who quickly identifies gaps and provides specific, "
            "actionable recommendations. You focus on keyword density, section structure, and measurable achievements."
        ),
        llm=evaluator_llm,
        max_iter=1,
        max_execution_time=120
    )

def build_refiner_agent():
    return Agent(
        role="Bullet Point Refiner",
        goal="Transform bullet points into high-impact, ATS-optimized statements with strong metrics.",
        backstory="You excel at creating powerful bullet points that combine action verbs, specific achievements, and quantified results. You work efficiently to maximize impact.",
        llm=refiner_llm,
        max_iter=1,
        max_execution_time=120
    )