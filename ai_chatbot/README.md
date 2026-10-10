# MedSimplify AI Chatbot Module (Google Gemini)

> **MedSimplify Medical Report Assistant** — Educational conversational intelligence for patient medical reports.

This is an independent, self-contained Python module responsible for answering user questions about uploaded medical laboratory reports in plain, reassuring, non-technical English using Google's official Gemini API Python SDK (`google-genai`).

---

## 1. What This Chatbot Does

When a user uploads a medical laboratory report (such as blood chemistry, CBC, lipid panel, or metabolic test), this chatbot answers their specific questions using the report as its primary source.

- **Translates Medical Terms**: Explains acronyms and clinical metrics in simple language.
- **Contextualizes Values**: Compares reported values with reference target ranges stated on the report.
- **Refuses Diagnoses**: Strictly avoids diagnosing conditions or diseases (e.g., refuses to state "You have diabetes").
- **Refuses Prescriptions**: Never prescribes drugs, medication changes, or dosages.
- **Identifies Missing Data**: Accurately informs the patient if a test or vital sign was not included in their report.
- **Structured Output**: Always returns strict JSON conforming to the defined Pydantic schema using Gemini structured outputs.

---

## 2. Project Structure

```text
ai_chatbot/
├── __init__.py          # Module exports (MedicalChatbot, answer_medical_question, schemas)
├── chatbot.py           # Core answer_medical_question function, MedicalChatbot class & Gemini Structured Outputs
├── prompts.py           # System prompts, safety rules, multi-turn history builder
├── schemas.py           # Pydantic schemas (ChatbotResponse, RelevantValue)
├── test_chatbot.py      # 8 test scenarios, schema validation, and pytest suite
├── sample_report.txt    # Fictional laboratory report for software testing
├── requirements.txt     # Minimal Python dependencies (google-genai, pydantic, python-dotenv, pytest)
├── .env.example         # Example environment variables template
├── .gitignore           # Ignores .env and Python cache files
└── README.md            # Documentation and integration guide
```

---

## 3. How to Create a Virtual Environment

Navigate to the project root or the `ai_chatbot/` folder:

```bash
# On Windows (PowerShell):
python -m venv venv
.\venv\Scripts\activate

# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate
```

---

## 4. How to Install Dependencies

With the virtual environment activated, install the required packages:

```bash
pip install -r ai_chatbot/requirements.txt
```

---

## 5. How to Create `.env`

Copy the example configuration file:

```bash
# On Windows (PowerShell):
Copy-Item ai_chatbot/.env.example ai_chatbot/.env

# On macOS/Linux:
cp ai_chatbot/.env.example ai_chatbot/.env
```

---

## 6. Where to Put `GEMINI_API_KEY`

Open `ai_chatbot/.env` in any text editor and add your Google Gemini API key:

```env
GEMINI_API_KEY=AIzaSy...your-actual-gemini-api-key-here
GEMINI_MODEL=gemini-2.5-flash
```

> **Security Note**: Never commit your `.env` file to version control. The `.gitignore` file is pre-configured to prevent `.env` from being tracked.

---

## 7. How to Run the Tests

### Option A: Standalone 8-Scenario Formatted Test Runner
Runs all 8 mandatory safety scenarios against `sample_report.txt` and prints formatted sections (`## QUESTION`, `## AI ANSWER`, `## RELEVANT VALUES`):

```bash
python ai_chatbot/test_chatbot.py
```

### Option B: Pytest Automated Suite
Runs unit tests, mock tests, and parameter validations:

```bash
python -m pytest ai_chatbot/test_chatbot.py -v
```

---

## 8. Example Input and Output

### Basic Function Usage:
```python
from ai_chatbot import answer_medical_question

report_text = """
Patient Report
HbA1c: 6.1 %
Reference Range: < 5.7 %
Hemoglobin: 13.2 g/dL
Reference Range: 13.0 - 17.0 g/dL
"""

user_question = "Is my HbA1c okay?"

result = answer_medical_question(report_text, user_question)
print(result)
```

### Class-Based Usage with Conversation History:
```python
from ai_chatbot import MedicalChatbot

bot = MedicalChatbot()

history = [
    {"role": "user", "content": "What is HbA1c?"},
    {"role": "assistant", "content": "HbA1c measures 3-month average blood sugar."}
]

result = bot.ask(
    report_text=report_text,
    user_question="Is mine high?",
    conversation_history=history
)
print(result)
```

### Output JSON:
```json
{
  "answer": "Your report lists an HbA1c of 6.1%, while the reference range target is below 5.7%. This means your result is above the reference target shown on your report. HbA1c measures your average blood sugar levels over the past 2 to 3 months. This is an educational observation and not a diagnosis, so please discuss this finding with your healthcare professional.",
  "based_on_report": true,
  "relevant_values": [
    {
      "test": "HbA1c",
      "value": "6.1 %",
      "reference_range": "< 5.7 %"
    }
  ],
  "safety_note": "Discuss medical decisions and interpretation with a qualified healthcare professional."
}
```

---

## 9. Medical Safety Limitations

1. **Non-Diagnostic**: The assistant strictly explains reported numbers and medical vocabulary. It does not evaluate pathology or assign disease diagnoses.
2. **No Treatment / Prescribing**: It never advises medication changes or drug therapies.
3. **No Hallucinated Data**: If a test is not in the text, it explicitly states it is missing.
4. **Physician Partnership**: Every answer directs the patient to discuss their results with their physician.

---

## 10. How to Integrate Into the FastAPI Backend (Phase 3)

When integrating into the backend (`backend/main.py`), you can import `answer_medical_question` or `MedicalChatbot` directly:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from ai_chatbot import answer_medical_question, MedicalChatbot

app = FastAPI()
bot = MedicalChatbot()

class ChatRequest(BaseModel):
    report_text: str
    user_question: str
    conversation_history: Optional[List[Dict[str, str]]] = None

@app.post("/api/chat-report")
async def chat_report_endpoint(req: ChatRequest):
    try:
        response = bot.ask(
            report_text=req.report_text,
            user_question=req.user_question,
            conversation_history=req.conversation_history
        )
        return response
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred processing your question.")
```
