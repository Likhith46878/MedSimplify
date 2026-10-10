"""
AI Report Analyzer for MedSimplify
Transforms extracted medical report text into patient-friendly structured analysis via Google Gemini.
"""

import os
import json
import time
import logging
from pathlib import Path
from typing import Dict, Any, Optional

from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import APIError

try:
    from .schemas import AIAnalysisReport
    from .validator import validate_analysis_report
except ImportError:
    from schemas import AIAnalysisReport
    from validator import validate_analysis_report

# Load environment variables
load_dotenv()
# Also load from ai_chatbot/.env if present
root_env = Path(__file__).resolve().parent.parent / "ai_chatbot" / ".env"
if root_env.exists():
    load_dotenv(root_env)

logger = logging.getLogger("MedSimplifyAnalyzer")

ANALYSIS_SYSTEM_PROMPT = """You are the MedSimplify Medical Report Simplification Engine.
Your task is to analyze extracted text from a patient's medical laboratory report and translate it into a clear, reassuring, structured explanation in simple English.

CRITICAL SAFETY DIRECTIVES:
1. EDUCATIONAL PURPOSES ONLY: You are not a physician. Never provide a medical diagnosis (e.g. do not say "You have diabetes", "You have anemia", or "You have polycythemia").
2. NEVER PRESCRIBE: Never recommend medications, drug changes, medical procedures, or dosages.
3. PRESERVE NUMERICAL ACCURACY: Keep numerical test values, decimal precision, and units exactly as shown in the report.
   - Under NO circumstances alter digits or add/remove zeros (e.g. if Platelet Count is 155,000 or 155000, it MUST remain 155,000; it must NEVER become 1,550,000 or 1550000).
   - Never multiply or divide a laboratory value automatically.
4. RESPECT REPORT RANGES & NEVER BORROW RANGES:
   - Compare reported values strictly against the reference range explicitly printed for THAT specific test.
   - If a test has no separate reference range or the alignment is unclear (for example, RBC count having no explicit range printed), set `reference_range` to "Not provided in report".
   - NEVER borrow or copy a reference range from an adjacent test (e.g. NEVER copy Haemoglobin's 14-16 range to RBC count).
5. DO NOT CALL UNCERTAIN RESULTS NORMAL OR ABNORMAL:
   - If a test's reference range or unit is absent or unclear, explain what the test measures neutrally without claiming it is normal or abnormal.
6. UNIT FIELD ACCURACY:
   - The `unit` field must contain ONLY the unit of measurement (e.g. "g/dL", "g%", "%", "fl", "pg", "/cu.mm", "mg/dL"), or an empty string "" if no unit is printed.
   - NEVER write "Not provided in report" in the `unit` field.
7. IDENTIFY IMPORTANT FINDINGS:
   - Highlight values that fall outside the report's printed reference ranges.
   - If extraction quality is poor or a metric appears internally inconsistent, explicitly note that verification with the original report is advised.
8. CLEAR PATIENT LANGUAGE: Explain complex medical acronyms and terms in reassuring, easy-to-understand words.
9. EMPOWERING DOCTOR QUESTIONS: Generate 3 to 5 thoughtful questions the patient can ask their doctor.

OUTPUT STRUCTURE:
You must return valid structured JSON strictly matching the AIAnalysisReport schema:
- overview: { sections_detected, total_tests_analyzed, important_findings_count, status }
- summary: 2-4 sentence plain-English summary of what the report contains and the overall picture.
- important_findings: list of items with { title, value, explanation, importance: "high"|"moderate"|"low" }
- key_values: list of items with { test, value, unit, reference_range, explanation }
- what_this_means: 1-2 paragraph educational interpretation connecting the results in simple words without diagnosing.
- doctor_questions: list of 3-5 questions to ask the doctor.
"""


def get_gemini_client(api_key: Optional[str] = None) -> genai.Client:
    """Returns an authenticated Gemini client."""
    resolved_key = api_key or os.getenv("GEMINI_API_KEY")
    if not resolved_key or not resolved_key.strip() or resolved_key.strip() == "your_gemini_api_key_here":
        raise ValueError(
            "GEMINI_API_KEY is not set or is invalid. Please configure GEMINI_API_KEY in your .env file."
        )
    return genai.Client(api_key=resolved_key.strip())


def analyze_medical_text(
    cleaned_text: str,
    api_key: Optional[str] = None,
    model: Optional[str] = None,
    max_retries: int = 2
) -> AIAnalysisReport:
    """
    Sends extracted medical text to Gemini to generate structured analysis.
    Validates output integrity before returning.
    """
    if not cleaned_text or len(cleaned_text.strip()) < 10:
        raise ValueError("The provided medical report text is too short or empty to analyze.")

    client = get_gemini_client(api_key=api_key)
    selected_model = model or os.getenv("GEMINI_MODEL", "gemini-flash-lite-latest")

    user_prompt = f"""EXTRACTED MEDICAL REPORT TEXT (UNTRUSTED PATIENT DATA):
==================================================
{cleaned_text}
==================================================

Please analyze this medical report according to the MedSimplify system instructions.
Extract every individual test with its exact value, exact unit, and exact reference range.
Remember:
- Do NOT alter numbers or add zeros (e.g. 155,000 must remain 155,000).
- If a test has no explicit range printed (e.g. RBC count), set reference_range to 'Not provided in report'.
- Never copy Haemoglobin's reference range to RBC.
- Leave unit as empty string '' if no unit is printed.
Return structured JSON conforming to the AIAnalysisReport schema."""

    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=AIAnalysisReport,
        system_instruction=ANALYSIS_SYSTEM_PROMPT,
        temperature=0.1,
    )

    last_err = None
    for attempt in range(max_retries + 1):
        try:
            response = client.models.generate_content(
                model=selected_model,
                contents=user_prompt,
                config=config,
            )

            if response.text:
                data = json.loads(response.text)
                parsed_report = AIAnalysisReport(**data)
                # Apply deterministic validation
                return validate_analysis_report(parsed_report, cleaned_text)

            raise ValueError("Received empty response from Gemini API.")

        except APIError as e:
            last_err = e
            logger.warning("Gemini API error on attempt %d/%d: %s", attempt + 1, max_retries + 1, e)
            if attempt < max_retries and ("503" in str(e) or "429" in str(e) or "UNAVAILABLE" in str(e)):
                time.sleep(1.5 * (attempt + 1))
                continue
            raise RuntimeError(f"Gemini AI service error: {str(e)}") from e
        except json.JSONDecodeError as e:
            logger.error("JSON parsing error from Gemini: %s", e)
            raise RuntimeError("Received malformed JSON structure from AI service.") from e
        except Exception as e:
            last_err = e
            logger.error("Error analyzing medical report: %s", e)
            if attempt < max_retries and ("503" in str(e) or "429" in str(e)):
                time.sleep(1.5 * (attempt + 1))
                continue
            raise

    raise RuntimeError(f"Failed to analyze report after {max_retries + 1} attempts: {last_err}")
