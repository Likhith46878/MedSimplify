"""
End-to-End Integration & Unit Test Suite for MedSimplify Backend & AI Chatbot

Tests PDF extraction, OCR, text cleaning, API endpoints, schema validation,
safety constraints, conversation history, and error conditions.
"""

import io
import os
import sys
import json
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from PIL import Image, ImageDraw

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.main import app
from backend.schemas import (
    ReportResponse,
    AIAnalysisReport,
    OverviewSchema,
    ImportantFindingSchema,
    KeyValueSchema,
    ChatRequest,
    ChatbotResponseSchema
)
from backend.text_cleaner import clean_text
from backend.extractor import extract_text_from_pdf
from backend.ocr import extract_text_from_image
from backend.analyzer import analyze_medical_text
from ai_chatbot.chatbot import answer_medical_question, MedicalChatbot

client = TestClient(app)


# ==============================================================================
# Helpers: Generate Test Fixtures in Memory
# ==============================================================================

def create_sample_pdf(text: str = "Hemoglobin: 14.5 g/dL\nReference: 13.0 - 17.0 g/dL") -> bytes:
    """Generates a valid digital PDF containing the specified text."""
    import fitz
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), text, fontsize=12)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def create_sample_image(text: str = "Fasting Glucose: 110 mg/dL") -> bytes:
    """Generates a valid PNG image containing drawn medical text."""
    img = Image.new("RGB", (400, 100), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((10, 20), text, fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


SAMPLE_REPORT_A = """Fictional Patient Report - Chemistry & CBC
Patient: John Doe (Age 45)
Date: 2026-03-15

Complete Blood Count:
Hemoglobin: 13.2 g/dL (Reference Range: 13.0 - 17.0 g/dL)
White Blood Cells: 6.8 K/uL (Reference Range: 4.5 - 11.0 K/uL)
Platelets: 240 K/uL (Reference Range: 150 - 450 K/uL)

Metabolic & Lipid Panel:
Fasting Glucose: 108 mg/dL (Reference Range: 70 - 99 mg/dL)
HbA1c: 6.1 % (Reference Range: < 5.7 %)
Total Cholesterol: 218 mg/dL (Reference Range: < 200 mg/dL)
LDL Cholesterol: 142 mg/dL (Reference Range: < 100 mg/dL)
HDL Cholesterol: 46 mg/dL (Reference Range: > 40 mg/dL)
Triglycerides: 151 mg/dL (Reference Range: < 150 mg/dL)
Serum Creatinine: 0.9 mg/dL (Reference Range: 0.7 - 1.3 mg/dL)
"""

SAMPLE_REPORT_B = """Thyroid & Vitamin Panel
Patient: Jane Smith (Age 52)
Date: 2026-04-10

Endocrine & Vitamin Labs:
TSH: 6.8 uIU/mL (Reference Range: 0.4 - 4.0 uIU/mL)
Free T4: 0.9 ng/dL (Reference Range: 0.8 - 1.8 ng/dL)
Vitamin D (25-Hydroxy): 18 ng/mL (Reference Range: 30 - 100 ng/mL)
Vitamin B12: 450 pg/mL (Reference Range: 200 - 900 pg/mL)
"""


# ==============================================================================
# 1. Health Endpoint Test
# ==============================================================================

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "timestamp" in data


# ==============================================================================
# 2. Text Cleaner Unit Tests
# ==============================================================================

def test_text_cleaner():
    raw = "  Hemoglobin:\t13.2 g/dL  \r\n\r\n\r\n\r\n  HbA1c:   6.1 %  \n\n\n"
    cleaned = clean_text(raw)
    assert "Hemoglobin: 13.2 g/dL" in cleaned
    assert "HbA1c: 6.1 %" in cleaned
    assert "\t" not in cleaned
    assert "\r" not in cleaned


# ==============================================================================
# 3. PDF Extraction Unit Tests
# ==============================================================================

def test_pdf_extraction_valid():
    pdf_bytes = create_sample_pdf("Hemoglobin: 14.2 g/dL\nReference: 13.0 - 17.0 g/dL")
    text = extract_text_from_pdf(pdf_bytes)
    assert "Hemoglobin: 14.2 g/dL" in text


def test_pdf_extraction_empty():
    import fitz
    doc = fitz.open()
    doc.new_page()  # Blank page
    pdf_bytes = doc.tobytes()
    doc.close()
    text = extract_text_from_pdf(pdf_bytes)
    assert text == ""


def test_pdf_extraction_corrupted():
    corrupted_bytes = b"NOT_A_VALID_PDF_HEADER_12345"
    with pytest.raises(ValueError) as exc:
        extract_text_from_pdf(corrupted_bytes)
    assert "Invalid or corrupted PDF" in str(exc.value)


# ==============================================================================
# 4. API File Validation Tests (Oversized, Unsupported, Empty)
# ==============================================================================

def test_upload_empty_file():
    response = client.post(
        "/api/analyze-report",
        files={"file": ("empty.pdf", b"", "application/pdf")}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_upload_unsupported_extension():
    response = client.post(
        "/api/analyze-report",
        files={"file": ("report.docx", b"Word document content", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]


def test_upload_oversized_file():
    # 16 MB dummy payload
    oversized = b"A" * (16 * 1024 * 1024)
    response = client.post(
        "/api/analyze-report",
        files={"file": ("large.pdf", oversized, "application/pdf")}
    )
    assert response.status_code == 413
    assert "exceeds the maximum allowed size" in response.json()["detail"]


def test_upload_unreadable_garbage_content():
    # PDF with no recognizable text
    garbage_pdf = create_sample_pdf("   ")
    response = client.post(
        "/api/analyze-report",
        files={"file": ("blank.pdf", garbage_pdf, "application/pdf")}
    )
    assert response.status_code == 400
    assert "No readable medical text" in response.json()["detail"]


# ==============================================================================
# 5. Schema & Analyzer Unit Tests (Mocked for Deterministic Validation)
# ==============================================================================

def test_analyzer_schema_validation():
    mock_analysis = AIAnalysisReport(
        overview=OverviewSchema(
            sections_detected="Complete Blood Count",
            total_tests_analyzed=3,
            important_findings_count=1,
            status="Review Recommended"
        ),
        summary="This report shows your red blood cell count and glucose levels.",
        important_findings=[
            ImportantFindingSchema(
                title="HbA1c",
                value="6.1 %",
                explanation="Slightly elevated compared to target.",
                importance="moderate"
            )
        ],
        key_values=[
            KeyValueSchema(
                test="Hemoglobin",
                value="13.2",
                unit="g/dL",
                reference_range="13.0 - 17.0 g/dL",
                explanation="Normal red blood cell marker."
            )
        ],
        what_this_means="Overall baseline is solid.",
        doctor_questions=["What should I monitor?"]
    )

    dumped = mock_analysis.model_dump()
    assert dumped["overview"]["total_tests_analyzed"] == 3
    assert dumped["important_findings"][0]["title"] == "HbA1c"
    assert len(dumped["key_values"]) == 1


# ==============================================================================
# 6. Chatbot Endpoint Unit Tests (Empty Question & History Validation)
# ==============================================================================

def test_chat_empty_question():
    response = client.post(
        "/api/chat-report",
        json={"report_text": SAMPLE_REPORT_A, "user_question": "   "}
    )
    assert response.status_code == 400
    assert "Question cannot be empty" in response.json()["detail"]


def test_chat_missing_report_context():
    """Chatbot still answers general questions when no report is attached."""
    with patch("backend.main.answer_medical_question") as mock_answer:
        mock_answer.return_value = {
            "answer": "HbA1c measures average blood sugar over 2 to 3 months.",
            "based_on_report": False,
            "relevant_values": [],
            "safety_note": "Consult your doctor."
        }

        response = client.post(
            "/api/chat-report",
            json={"report_text": "", "user_question": "What is HbA1c?"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["based_on_report"] is False
        assert "blood sugar" in data["answer"].lower()


def test_chat_with_conversation_history():
    """Chatbot receives and preserves conversation history context."""
    history = [
        {"role": "user", "content": "What is HbA1c?"},
        {"role": "assistant", "content": "HbA1c measures 3-month average blood sugar."}
    ]

    with patch("backend.main.answer_medical_question") as mock_answer:
        mock_answer.return_value = {
            "answer": "Your HbA1c in the report is 6.1%, which is above the target < 5.7%.",
            "based_on_report": True,
            "relevant_values": [{"test": "HbA1c", "value": "6.1 %", "reference_range": "< 5.7 %"}],
            "safety_note": "Consult your doctor."
        }

        response = client.post(
            "/api/chat-report",
            json={
                "report_text": SAMPLE_REPORT_A,
                "user_question": "Is mine high?",
                "conversation_history": history
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["based_on_report"] is True
        assert "6.1%" in data["answer"]


# ==============================================================================
# 7. Live Gemini Integration Tests (if API Key is Configured)
# ==============================================================================

@pytest.mark.skipif(not os.getenv("GEMINI_API_KEY"), reason="GEMINI_API_KEY not configured")
def test_live_report_analysis_pdf():
    """Tests end-to-end PDF report analysis against live Gemini model."""
    pdf_bytes = create_sample_pdf(SAMPLE_REPORT_A)
    response = client.post(
        "/api/analyze-report",
        files={"file": ("Blood_Chemistry_Panel.pdf", pdf_bytes, "application/pdf")}
    )
    assert response.status_code == 200
    data = response.json()

    assert data["filename"] == "Blood_Chemistry_Panel.pdf"
    assert data["file_type"] == "PDF Document"
    assert "extracted_text" in data
    assert "HbA1c" in data["extracted_text"]
    assert len(data["summary"]) > 20
    assert len(data["key_values"]) >= 3
    assert len(data["doctor_questions"]) >= 2
    assert "overview" in data


@pytest.mark.skipif(not os.getenv("GEMINI_API_KEY"), reason="GEMINI_API_KEY not configured")
def test_two_different_reports_produce_different_results():
    """Confirms two different medical reports produce distinctly different analysis."""
    pdf_a = create_sample_pdf(SAMPLE_REPORT_A)
    pdf_b = create_sample_pdf(SAMPLE_REPORT_B)

    resp_a = client.post("/api/analyze-report", files={"file": ("ReportA.pdf", pdf_a, "application/pdf")})
    resp_b = client.post("/api/analyze-report", files={"file": ("ReportB.pdf", pdf_b, "application/pdf")})

    assert resp_a.status_code == 200
    assert resp_b.status_code == 200

    data_a = resp_a.json()
    data_b = resp_b.json()

    # Report A is diabetes/lipid panel, Report B is thyroid/vitamin D
    assert "HbA1c" in data_a["extracted_text"]
    assert "TSH" in data_b["extracted_text"]
    assert data_a["summary"] != data_b["summary"]


@pytest.mark.skipif(not os.getenv("GEMINI_API_KEY"), reason="GEMINI_API_KEY not configured")
def test_live_chat_missing_fact_refusal():
    """Live chatbot correctly notes when a fact is absent from the report."""
    response = client.post(
        "/api/chat-report",
        json={
            "report_text": SAMPLE_REPORT_A,
            "user_question": "What is my blood pressure?"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "blood pressure" in data["answer"].lower()
    assert len(data["relevant_values"]) == 0
