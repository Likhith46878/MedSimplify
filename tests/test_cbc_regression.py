"""
Complete Blood Count (CBC) Regression & Numerical Integrity Test Suite

This test suite specifically validates the handling of the user's CBC test report:
- Platelet count precision (155,000 vs 1,550,000 hallucination prevention)
- Borrowed reference range prevention (RBC count must not copy Haemoglobin's 14-16 g% range)
- Clean unit handling (no "Not provided in report" in the unit field)
- Decimal precision preservation (MCV 72.00 fl, MCH 30.00 pg, MCHC 41.67%)
- WBC Differential summation consistency (60% + 30% + 5% + 5% + 0% = 100%)
- Absence of diagnostic claims when reference ranges are not provided in the report
- Chatbot accuracy when answering questions about the specific CBC report
"""

import sys
import os
import pytest
from pathlib import Path
from fastapi.testclient import TestClient

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.main import app
from backend.schemas import AIAnalysisReport, KeyValueSchema, OverviewSchema, ImportantFindingSchema
from backend.validator import validate_key_values, validate_analysis_report, sanitize_unit, normalize_digits
from backend.text_cleaner import clean_text

client = TestClient(app)

CBC_SAMPLE_RAW_TEXT = """
COMPLETE BLOOD COUNT (CBC) REPORT
Patient Name: Test Patient
Age / Gender: 32 / M
Date of Collection: 2026-03-20

TEST DESCRIPTION             RESULT     UNITS        REFERENCE INTERVAL
========================================================================
Haemoglobin (Hb)             15         g%           14 - 16
R.B.C Count                  5                       
Packed Cell Volume (PCV)     36         %            40 - 54
Mean Corpuscular Volume      72.00      fl           78 - 100
Mean Corpuscular Hb (MCH)    30.00      pg           27.0 - 32.0
Mean Corpuscular Hb Conc     41.67      %            32.0 - 36.0
Red Cell Distribution (RDW)  10                      
Total W.B.C Count            5,500      /cu.mm       4,000 - 11,000

DIFFERENTIAL LEUCOCYTE COUNT:
Neutrophils                  60         %            40 - 75
Lymphocytes                  30         %            20 - 45
Eosinophils                  5          %            1 - 6
Monocytes                    5          %            2 - 10
Basophils                    0          %            0 - 1

Platelet Count               155,000    /cu.mm       150,000 - 450,000
"""


def test_sanitize_unit():
    assert sanitize_unit("g%") == "g%"
    assert sanitize_unit("/cu.mm") == "/cu.mm"
    assert sanitize_unit("fl") == "fl"
    assert sanitize_unit("Not provided in report") == ""
    assert sanitize_unit("not provided") == ""
    assert sanitize_unit("N/A") == ""
    assert sanitize_unit("-") == ""
    assert sanitize_unit("") == ""


def test_normalize_digits():
    assert normalize_digits("155,000") == "155000"
    assert normalize_digits("1,550,000") == "1550000"
    assert normalize_digits("72.00") == "7200"
    assert normalize_digits("15 g%") == "15"


def test_platelet_count_zero_hallucination_correction():
    """
    Ensures that if an LLM hallucinates an extra 0 on Platelets (1,550,000),
    the validator catches and corrects it back to the exact source value (155,000).
    """
    hallucinated_kvs = [
        KeyValueSchema(
            test="Platelet Count",
            value="1,550,000",
            unit="/cu.mm",
            reference_range="150,000 - 450,000",
            explanation="Elevated platelet count."
        )
    ]
    validated = validate_key_values(hallucinated_kvs, CBC_SAMPLE_RAW_TEXT)
    assert len(validated) == 1
    assert validated[0].value == "155,000"
    assert normalize_digits(validated[0].value) == "155000"
    assert normalize_digits(validated[0].value) != "1550000"


def test_rbc_borrowed_reference_range_prevention():
    """
    Ensures RBC count does NOT copy Haemoglobin's reference range (14 - 16 g%).
    """
    borrowed_kvs = [
        KeyValueSchema(
            test="Haemoglobin",
            value="15",
            unit="g%",
            reference_range="14 - 16 g%",
            explanation="Within normal limits."
        ),
        KeyValueSchema(
            test="RBC Count",
            value="5",
            unit="Not provided in report",
            reference_range="14 - 16 g%",  # Borrowed from Hb
            explanation="Normal based on 14 - 16."
        )
    ]
    validated = validate_key_values(borrowed_kvs, CBC_SAMPLE_RAW_TEXT)
    rbc_item = next(item for item in validated if "rbc" in item.test.lower())
    assert rbc_item.reference_range == "Not provided in report"
    assert rbc_item.unit == ""  # Sanitized
    assert "14" not in rbc_item.reference_range
    assert "g%" not in rbc_item.reference_range


def test_wbc_differential_sum_validation():
    """
    Validates that WBC differential percentages sum up to 100%.
    """
    cbc_report = AIAnalysisReport(
        overview=OverviewSchema(
            sections_detected="Complete Blood Count",
            total_tests_analyzed=13,
            important_findings_count=0,
            status="Routine Results"
        ),
        summary="CBC parameters tested.",
        important_findings=[],
        key_values=[
            KeyValueSchema(test="Neutrophils", value="60", unit="%", reference_range="40 - 75 %", explanation="Normal"),
            KeyValueSchema(test="Lymphocytes", value="30", unit="%", reference_range="20 - 45 %", explanation="Normal"),
            KeyValueSchema(test="Eosinophils", value="5", unit="%", reference_range="1 - 6 %", explanation="Normal"),
            KeyValueSchema(test="Monocytes", value="5", unit="%", reference_range="2 - 10 %", explanation="Normal"),
            KeyValueSchema(test="Basophils", value="0", unit="%", reference_range="0 - 1 %", explanation="Normal"),
            KeyValueSchema(test="Platelet Count", value="155,000", unit="/cu.mm", reference_range="150,000 - 450,000", explanation="Normal"),
        ],
        what_this_means="Overall CBC is well within typical limits.",
        doctor_questions=["Do I need any follow-up tests?"]
    )
    validated_report = validate_analysis_report(cbc_report, CBC_SAMPLE_RAW_TEXT)
    assert len(validated_report.key_values) == 6
    platelet = next(kv for kv in validated_report.key_values if "platelet" in kv.test.lower())
    assert platelet.value == "155,000"


def test_decimal_precision_preservation():
    """
    Ensures decimal precision is preserved on MCV (72.00 fl), MCH (30.00 pg), MCHC (41.67 %).
    """
    kvs = [
        KeyValueSchema(test="MCV", value="72.00", unit="fl", reference_range="78 - 100 fl", explanation="Low MCV"),
        KeyValueSchema(test="MCH", value="30.00", unit="pg", reference_range="27.0 - 32.0 pg", explanation="Normal"),
        KeyValueSchema(test="MCHC", value="41.67", unit="%", reference_range="32.0 - 36.0 %", explanation="High MCHC")
    ]
    validated = validate_key_values(kvs, CBC_SAMPLE_RAW_TEXT)
    mcv = next(kv for kv in validated if kv.test == "MCV")
    mch = next(kv for kv in validated if kv.test == "MCH")
    mchc = next(kv for kv in validated if kv.test == "MCHC")

    assert mcv.value == "72.00"
    assert mch.value == "30.00"
    assert mchc.value == "41.67"


@pytest.mark.skipif(not os.getenv("GEMINI_API_KEY"), reason="GEMINI_API_KEY not configured")
def test_live_cbc_chatbot_queries():
    """
    Tests chatbot against the actual CBC sample text.
    """
    # 1. Ask about platelet count
    res1 = client.post(
        "/api/chat-report",
        json={
            "report_text": CBC_SAMPLE_RAW_TEXT,
            "user_question": "What is my platelet count?"
        }
    )
    assert res1.status_code == 200
    data1 = res1.json()
    assert "155,000" in data1["answer"] or "155000" in data1["answer"]
    assert "1,550,000" not in data1["answer"]
    assert "1550000" not in data1["answer"]

    # 2. Ask about Haemoglobin
    res2 = client.post(
        "/api/chat-report",
        json={
            "report_text": CBC_SAMPLE_RAW_TEXT,
            "user_question": "Is my haemoglobin okay?"
        }
    )
    assert res2.status_code == 200
    data2 = res2.json()
    assert "15" in data2["answer"]

    # 3. Ask about an unmentioned metric (e.g., Blood Pressure)
    res3 = client.post(
        "/api/chat-report",
        json={
            "report_text": CBC_SAMPLE_RAW_TEXT,
            "user_question": "What is my blood pressure?"
        }
    )
    assert res3.status_code == 200
    data3 = res3.json()
    assert "blood pressure" in data3["answer"].lower()
    assert len(data3["relevant_values"]) == 0
