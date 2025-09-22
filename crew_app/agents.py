from crewai import Agent
from crewai.llm import BaseLLM
from typing import Optional, Union, List, Dict, Any
import requests
import os



API_KEY = os.getenv("EURO_API_KEY")
ENDPOINT = os.getenv("EURO_API_ENDPOINT")
MODEL = "gpt-4.1-nano"

class CustomLLM(BaseLLM):
    def __init__(self, model: str, euron_api_key: str, temperature: Optional[float] = None):
        # IMPORTANT: Call super().__init__() with required parameters
        super().__init__(model=model, temperature=temperature)
        
        self.euron_api_key = euron_api_key
        self.endpoint = ENDPOINT
        
    def call(
        self,
        messages: Union[str, List[Dict[str, str]]],
        tools: Optional[List[dict]] = None,
        callbacks: Optional[List[Any]] = None,
        available_functions: Optional[Dict[str, Any]] = None,
        **kwargs  # Capture any unexpected keyword arguments (like `from_task`)
    ) -> Union[str, Any]:
        """Call the LLM using Euron as a middleware."""
        # If there are unexpected arguments, `kwargs` will capture them
        # You can optionally log or use these args if needed
        
        # Convert string to message format if needed
        if isinstance(messages, str):
            messages = [{"role": "user", "content": messages}]
        
        # Prepare the payload for the Euron API
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": 1000  # You can modify the max tokens if needed
        }
        
        # Make API call to Euron
        response = self._make_api_call(payload)
        
        # Return the result from the OpenAI model via Euron
        return response["choices"][0]["message"]["content"]
        
    def _make_api_call(self, payload: dict) -> dict:
        """Send the request to Euron API."""
        try:
            response = requests.post(
                self.endpoint,
                headers={
                    "Authorization": f"Bearer {self.euron_api_key}",
                    "Content-Type": "application/json"
                },
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        
        except requests.Timeout:
            raise TimeoutError("LLM request timed out")
        except requests.RequestException as e:
            raise RuntimeError(f"LLM request failed: {str(e)}")
        except (KeyError, IndexError) as e:
            raise ValueError(f"Invalid response format: {str(e)}")

    def supports_function_calling(self) -> bool:
        """Override if your LLM supports function calling."""
        return True  # Change to False if your LLM doesn't support tools
        
    def get_context_window_size(self) -> int:
        """Return the context window size of your LLM."""
        return 8192
    
custom_llm = CustomLLM(
    model=MODEL, 
    euron_api_key=API_KEY,
    temperature=0.7
)

def build_parser_agent():
    return Agent(
        role="Resume Parsing Specialist",
        goal="Extract clean, structured text from a resume suitable for ATS optimization.",
        backstory=(
            "You efficiently clean resume text by removing artifacts and normalizing formatting. "
            "Focus on speed and accuracy - preserve all important content while removing noise."
        ),
        model=MODEL,
        llm=CustomLLM,
        temperature=0.0,
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
        model=MODEL,
        llm=CustomLLM,
        temperature=0.3,
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
        model=MODEL,
        llm=CustomLLM,
        temperature=0.0,
        max_iter=1,
        max_execution_time=120
    )

def build_refiner_agent():
    return Agent(
        role="Bullet Point Refiner",
        goal="Transform bullet points into high-impact, ATS-optimized statements with strong metrics.",
        backstory="You excel at creating powerful bullet points that combine action verbs, specific achievements, and quantified results. You work efficiently to maximize impact.",
        model=MODEL,
        llm=CustomLLM,
        temperature=0.2,
        max_iter=1,
        max_execution_time=120
    )

