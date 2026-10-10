# MedSimplify

> **Understand your medical reports in simple language.**

MedSimplify is a secure, privacy-first web application that translates complex medical reports, lab results, and diagnostic scans into clear, patient-friendly explanations without medical jargon.

---

## 1. What MedSimplify Does

Medical laboratory reports and clinical summaries are often packed with abbreviations, numerical lab ranges, and clinical terminology that patients find confusing and stressful.

MedSimplify bridges this communication gap:
1. **Upload**: Accepts PDF medical documents or JPG/JPEG/PNG report images.
2. **Text Extraction**: Uses **PyMuPDF** for digital PDFs and **Tesseract OCR** for medical images.
3. **AI Simplification**: Sends extracted text with strict safety instructions to the OpenAI API.
4. **Structured Presentation**: Displays high-level summaries, key lab values with reference ranges, plain-English explanations of what the results mean, and customized questions to ask your healthcare provider.

---

## 2. Features

- **Multi-Format Ingestion**: Supports `.pdf`, `.jpg`, `.jpeg`, and `.png` medical reports up to 15 MB.
- **Intelligent Text Extraction**: High-fidelity text extraction via PyMuPDF (PDFs) and Tesseract OCR (images).
- **Patient-Centric Report Summary**: Clear, compassionate 2–4 sentence high-level overview.
- **Important Findings with Importance Badges**: Highlighted key observations with severity tags (`Low`, `Moderate`, `High`).
- **Structured Key Values Table**: Lab metrics displayed with test name, measured value, units, normal reference ranges, and plain explanations.
- **"What This Means" Insights**: Holistic explanation answering practical patient concerns in everyday language.
- **Doctor Discussion Guide**: Generated list of actionable, specific questions for follow-up doctor appointments with 1-click clipboard copy.
- **Print & Export Ready**: Built-in print/PDF export styling for patient records.
- **Privacy & Security First**: Uploaded documents are processed in-memory and never stored on disk or in a database.

---

## 3. Technology Stack

- **Frontend**:
  - React 18
  - Vite
  - Lucide React (accessible medical and UI icons)
  - Pure CSS with healthcare visual design system
- **Backend**:
  - Python 3.10+
  - FastAPI
  - Uvicorn
  - PyMuPDF (`fitz`) for PDF parsing
  - `pytesseract` + `Pillow` for Optical Character Recognition (OCR)
  - Pydantic v2
  - OpenAI Python SDK
  - `python-dotenv`

---

## 4. Project Structure

```text
MedSimplify/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CameraModal.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── DoctorQuestionsCard.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── FindingsCard.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── KeyValuesTable.jsx
│   │   │   ├── LoadingState.jsx
│   │   │   ├── PrivacyNotice.jsx
│   │   │   ├── ReportOverviewCard.jsx
│   │   │   ├── ReportResults.jsx
│   │   │   ├── SafetyNotice.jsx
│   │   │   ├── SummaryCard.jsx
│   │   │   └── WhatThisMeansCard.jsx
│   │   ├── data/
│   │   │   └── mockReport.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── main.py
│   ├── test_app.py
│   ├── requirements.txt
│   └── .env.example
│
├── README.md
└── .gitignore
```

---

## 5. Prerequisites

Before installing, ensure you have:
1. **Python 3.10+**
2. **Node.js 18+** & **npm**
3. **GeminiAI API Key** ([Get key here](https://platform.openai.com/api-keys))
4. *(Optional for image OCR)* **Tesseract OCR** installed on your system

---

## 6. Installation Instructions

### Clone / Navigate to Project Root
```bash
cd MedSimplify
```

### Backend Setup
```bash
# Navigate to backend
cd backend

# Create and activate virtual environment (optional but recommended)
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Frontend Setup
```bash
# Navigate to frontend
cd ../frontend

# Install node dependencies
npm install
```

---

## 7. Tesseract OCR Installation

For extracting text from uploaded images (JPG, PNG), Tesseract OCR is used:

### Windows:
1. Download installer from [UB-Mannheim Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki).
2. Run installer and install to default location: `C:\Program Files\Tesseract-OCR`.
3. Add `C:\Program Files\Tesseract-OCR` to your system `PATH`.
*(MedSimplify backend automatically checks standard installation paths if not in PATH).*

### macOS:
```bash
brew install tesseract
```

### Linux (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install -y tesseract-ocr
```

> **Note**: If Tesseract is not installed, digital PDF report extraction will still work seamlessly. If an image is uploaded without Tesseract installed, a clear error prompt will guide the user.

---

## 8. Environment Variable Setup

1. In the `backend/` directory, copy the example environment file:
```bash
cd backend
cp .env.example .env
```
2. Open `backend/.env` and add your OpenAI API key:
```env
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
```
*(Optional: specify model `OPENAI_MODEL=gpt-4o-mini`)*

---

## 9. How to Start the Backend

From the `backend/` directory:
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
Backend API will be running at: `http://127.0.0.1:8000`
API Docs (Swagger UI): `http://127.0.0.1:8000/docs`

---

## 10. How to Start the Frontend

From the `frontend/` directory in a new terminal:
```bash
npm run dev
```
Frontend web application will be accessible at: `http://localhost:5173`

---

## 11. API Endpoint Documentation

### `GET /health`
Verifies backend service health.
- **Response**:
```json
{
  "status": "ok",
  "service": "MedSimplify API",
  "version": "1.0.0"
}
```

### `POST /analyze-report`
Accepts multipart form-data containing a medical report file and returns a structured simple-language summary.
- **Content-Type**: `multipart/form-data`
- **Form Field**: `file` (`.pdf`, `.jpg`, `.jpeg`, `.png`, max 15MB)
- **Response**:
```json
{
  "summary": "This is a routine lipid panel blood test...",
  "important_findings": [
    {
      "title": "Slightly Elevated Total Cholesterol",
      "explanation": "Your cholesterol level is slightly above standard reference ranges.",
      "importance": "moderate"
    }
  ],
  "key_values": [
    {
      "test": "Total Cholesterol",
      "value": "215",
      "unit": "mg/dL",
      "reference_range": "< 200 mg/dL",
      "explanation": "Measures the overall amount of cholesterol in your blood."
    }
  ],
  "what_this_means": "Your results are generally reassuring with a minor elevation in cholesterol...",
  "doctor_questions": [
    "Do you recommend any dietary adjustments for my cholesterol level?",
    "When should we recheck this panel?"
  ],
  "filename": "blood_work.pdf",
  "file_type": "PDF"
}
```

### `POST /chat-report`
Accepts a patient question and optional report context, and returns a plain-English educational response.
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "message": "What does HbA1c mean?",
  "report_context": {
    "summary": "...",
    "important_findings": [...]
  }
}
```
- **Response**:
```json
{
  "reply": "HbA1c is a blood test that gives an estimate of your average blood sugar level over the previous 2–3 months..."
}
```

---

## 12. Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **"OpenAI API key is missing"** | `OPENAI_API_KEY` not set in `backend/.env` | Create `backend/.env` with `OPENAI_API_KEY=sk-...` |
| **"Unable to connect to backend"** | FastAPI server not running on port 8000 | Start backend with `uvicorn main:app --reload --port 8000` |
| **"Tesseract OCR engine is not configured"** | Tesseract not installed when uploading image | Install Tesseract OCR or upload PDF report |
| **"No readable text was found"** | Image or scan is blurry or blank | Upload a clearer image or a digital text PDF |
| **"File too large"** | Upload exceeds 15 MB limit | Compress file or extract relevant report pages |

---

## 13. Medical Safety & Privacy Note

- **No Medical Advice**: MedSimplify is strictly an educational tool to enhance patient health literacy. It does **not** provide diagnoses, treatment plans, or medication prescriptions.
- **Privacy First**: Uploaded documents and extracted medical texts are processed entirely in-memory and are never stored in databases or permanent server disks.
