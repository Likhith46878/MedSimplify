"""
Pydantic Schemas for MedSimplify AI Chatbot

Defines the strict structured output models for medical report question answering.
"""

from typing import List
from pydantic import BaseModel, Field


class RelevantValue(BaseModel):
    """Represents a specific test measurement extracted from the medical report."""
    test: str = Field(
        description="Name of the test or measurement mentioned in the report (e.g., HbA1c, Hemoglobin, LDL)."
    )
    value: str = Field(
        description="Exact value and unit as stated in the report (e.g., 6.1 %, 13.2 g/dL)."
    )
    reference_range: str = Field(
        default="Not provided in report",
        description="Reference target or range stated in the report (e.g., < 5.7 %, 13.0 - 17.0 g/dL)."
    )


class ChatbotResponse(BaseModel):
    """Standard structured JSON output for the MedSimplify Medical Report Assistant."""
    answer: str = Field(
        description="Clear, plain-English educational answer addressing the user's question."
    )
    based_on_report: bool = Field(
        description="True if the response is directly based on findings in the uploaded report; False if answering general medical information."
    )
    relevant_values: List[RelevantValue] = Field(
        default_factory=list,
        description="List of relevant test values present in the report that support the answer. Never invent values."
    )
    safety_note: str = Field(
        default="Discuss medical decisions and interpretation with a qualified healthcare professional.",
        description="Brief disclaimer reminding the user that this is not medical advice or a diagnosis."
    )
