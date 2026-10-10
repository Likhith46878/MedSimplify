"""
MedSimplify Medical Report Assistant — AI Chatbot Core Module

This module provides the core question-answering logic for uploaded medical reports
using the official Google GenAI Python SDK and structured output schemas.
"""

import os
import json
import logging
from typing import Optional, Dict, Any, List

from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import APIError

try:
    from .schemas import ChatbotResponse, RelevantValue
    from .prompts import SYSTEM_PROMPT, build_user_prompt
except ImportError:
    import sys
    from pathlib import Path
    _pkg_dir = Path(__file__).resolve().parent
    if str(_pkg_dir) not in sys.path:
        sys.path.insert(0, str(_pkg_dir))
    from schemas import ChatbotResponse, RelevantValue
    from prompts import SYSTEM_PROMPT, build_user_prompt

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger("MedSimplifyChatbot")


def get_gemini_client(api_key: Optional[str] = None) -> genai.Client:
    """
    Initializes and returns an authenticated Google GenAI client.
    Raises ValueError if no API key is available.
    """
    resolved_key = api_key or os.getenv("GEMINI_API_KEY")

    if not resolved_key or not resolved_key.strip() or resolved_key.strip() == "your_gemini_api_key_here":
        raise ValueError(
            "GEMINI_API_KEY is not set or is invalid. Please configure your GEMINI_API_KEY "
            "in your environment or the ai_chatbot/.env file."
        )

    return genai.Client(api_key=resolved_key.strip())


# Alias for backward compatibility if needed
get_openai_client = get_gemini_client


class MedicalChatbot:
    """
    High-level chatbot interface for interacting with patient medical reports using Gemini.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        client: Optional[genai.Client] = None,
    ):
        self.api_key = api_key
        self.default_model = model or os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self._client = client

    @property
    def client(self) -> genai.Client:
        """Returns the initialized GenAI client, creating one if not already provided."""
        if self._client is None:
            self._client = get_gemini_client(api_key=self.api_key)
        return self._client

    def ask(
        self,
        report_text: str,
        user_question: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        model: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Processes a medical query and returns a structured response dictionary.
        """
        return answer_medical_question(
            report_text=report_text,
            user_question=user_question,
            api_key=self.api_key,
            model=model or self.default_model,
            client=self.client,
            conversation_history=conversation_history,
        )


def answer_medical_question(
    report_text: str,
    user_question: str,
    api_key: Optional[str] = None,
    model: Optional[str] = None,
    client: Optional[genai.Client] = None,
    conversation_history: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    """
    Answers a patient's question about an uploaded medical report in simple English.

    Args:
        report_text: Extracted text of the medical laboratory report.
        user_question: The patient's question or inquiry.
        api_key: Optional Gemini API key override.
        model: Optional model name override (defaults to GEMINI_MODEL env var or 'gemini-2.5-flash').
        client: Optional pre-configured GenAI client instance.
        conversation_history: Optional list of previous chat messages [{"role": "user"|"assistant", "content": "..."}].

    Returns:
        A dictionary strictly adhering to the ChatbotResponse schema:
        {
            "answer": str,
            "based_on_report": bool,
            "relevant_values": [
                {
                    "test": str,
                    "value": str,
                    "reference_range": str
                }
            ],
            "safety_note": str
        }
    """
    if not user_question or not user_question.strip():
        return {
            "answer": "Please ask a question about your report or medical tests.",
            "based_on_report": False,
            "relevant_values": [],
            "safety_note": "Discuss medical decisions and interpretation with a qualified healthcare professional."
        }

    gemini_client = client or get_gemini_client(api_key=api_key)
    selected_model = model or os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    user_prompt = build_user_prompt(
        report_text=report_text,
        user_question=user_question,
        conversation_history=conversation_history,
    )

    try:
        # Request structured JSON output conforming to ChatbotResponse schema
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ChatbotResponse,
            system_instruction=SYSTEM_PROMPT,
            temperature=0.2,
        )

        response = gemini_client.models.generate_content(
            model=selected_model,
            contents=user_prompt,
            config=config,
        )

        raw_content = response.text
        if raw_content:
            data = json.loads(raw_content)
            # Validate through Pydantic
            validated = ChatbotResponse(**data)
            return validated.model_dump()

        raise ValueError("Received empty response from Gemini API.")

    except APIError as e:
        logger.error("Gemini API error during question answering: %s", str(e))
        raise RuntimeError(f"Gemini service error: {str(e)}") from e
    except json.JSONDecodeError as e:
        logger.error("Failed to parse JSON response from Gemini: %s", str(e))
        raise RuntimeError("Received invalid JSON format from AI service.") from e
    except Exception as e:
        logger.error("Unexpected error in answer_medical_question: %s", str(e))
        raise


if __name__ == "__main__":
    # Interactive CLI testing mode
    sample_file = os.path.join(os.path.dirname(__file__), "sample_report.txt")
    if os.path.exists(sample_file):
        with open(sample_file, "r", encoding="utf-8") as f:
            sample_report = f.read()
    else:
        sample_report = "HbA1c: 6.1%\nReference Range: < 5.7%\nHemoglobin: 13.2 g/dL\nReference Range: 13.0 - 17.0 g/dL"

    test_query = "Is my HbA1c okay?"
    print(f"Testing Chatbot with question: '{test_query}'...\n")
    try:
        result = answer_medical_question(sample_report, test_query)
        print(json.dumps(result, indent=2))
    except Exception as err:
        print(f"Error: {err}")
