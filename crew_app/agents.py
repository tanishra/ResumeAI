import os
from typing import Any, Dict, List, Optional, Union

from crewai import Agent, BaseLLM
from dotenv import load_dotenv
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is required")


class LangChainOpenAILLM(BaseLLM):
    def __init__(self, model: str, api_key: str, temperature: Optional[float] = None):
        super().__init__(model=model, temperature=temperature)
        self.client = ChatOpenAI(
            api_key=api_key,
            model=model,
            temperature=temperature if temperature is not None else 0.0,
            timeout=120,
            max_retries=2,
        )

    def call(
        self,
        messages: Union[str, List[Dict[str, Any]]],
        tools: Optional[List[dict]] = None,
        callbacks: Optional[List[Any]] = None,
        available_functions: Optional[Dict[str, Any]] = None,
    ) -> str:
        normalized_messages = self._normalize_messages(messages)
        response = self.client.invoke(normalized_messages)
        content = self._extract_content(response.content)
        return self._apply_stop_words(content)

    def supports_function_calling(self) -> bool:
        return False

    def supports_stop_words(self) -> bool:
        return False

    def get_context_window_size(self) -> int:
        return 128000

    def _normalize_messages(
        self, messages: Union[str, List[Dict[str, Any]]]
    ) -> List[Union[SystemMessage, HumanMessage, AIMessage]]:
        if isinstance(messages, str):
            return [HumanMessage(content=messages)]

        normalized: List[Union[SystemMessage, HumanMessage, AIMessage]] = []
        for message in messages:
            role = message.get("role", "user")
            content = self._extract_content(message.get("content", ""))

            if role == "system":
                normalized.append(SystemMessage(content=content))
            elif role == "assistant":
                normalized.append(AIMessage(content=content))
            else:
                normalized.append(HumanMessage(content=content))

        return normalized

    def _extract_content(self, content: Any) -> str:
        if isinstance(content, str):
            return content

        if isinstance(content, list):
            parts: List[str] = []
            for item in content:
                if isinstance(item, str):
                    parts.append(item)
                elif isinstance(item, dict):
                    text = item.get("text")
                    if text:
                        parts.append(str(text))
            return "\n".join(parts).strip()

        if content is None:
            return ""

        return str(content)

    def _apply_stop_words(self, content: str) -> str:
        stop_words = getattr(self, "stop", None) or []
        for stop_word in stop_words:
            if stop_word in content:
                return content.split(stop_word)[0]
        return content


def _build_llm(temperature: float) -> LangChainOpenAILLM:
    return LangChainOpenAILLM(
        model=OPENAI_MODEL,
        api_key=OPENAI_API_KEY,
        temperature=temperature,
    )


parser_llm = _build_llm(0.0)
writer_llm = _build_llm(0.3)
evaluator_llm = _build_llm(0.0)
refiner_llm = _build_llm(0.2)


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
        max_execution_time=120,
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
        max_execution_time=120,
    )


def build_refiner_agent():
    return Agent(
        role="Bullet Point Refiner",
        goal="Transform bullet points into high-impact, ATS-optimized statements with strong metrics.",
        backstory=(
            "You excel at creating powerful bullet points that combine action verbs, specific "
            "achievements, and quantified results. You work efficiently to maximize impact."
        ),
        llm=refiner_llm,
        max_iter=1,
        max_execution_time=120,
    )
