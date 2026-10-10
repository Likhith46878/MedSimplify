"""
MedSimplify FastAPI Backend Application
Handles report uploads, text extraction, OCR, AI report summarization, and interactive chatbot Q&A.
"""

import os
import sys
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Ensure root project directories are accessible for module imports
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

# Load environment variables
load_dotenv()
env_path = ROOT_DIR / "ai_chatbot" / ".env"
if env_path.exists():
    load_dotenv(env_path)

try:
    from backend.schemas import (
        ReportResponse,
        ChatRequest,
        ChatbotResponseSchema,
    )
    from backend.extractor import extract_text_from_pdf
    from backend.ocr import extract_text_from_image
    from backend.text_cleaner import clean_text
    from backend.analyzer import analyze_medical_text
except ImportError:
    from schemas import (
        ReportResponse,
        ChatRequest,
        ChatbotResponseSchema,
    )
    from extractor import extract_text_from_pdf
    from ocr import extract_text_from_image
    from text_cleaner import clean_text
    from analyzer import analyze_medical_text

try:
    from ai_chatbot.chatbot import answer_medical_question
except ImportError:
    from chatbot import answer_medical_question

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MedSimplifyBackend")

app = FastAPI(
    title="MedSimplify API",
    description="Backend API for medical report simplification and patient-friendly AI analysis.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/octet-stream"  # For generic uploads
}


def format_file_size(size_bytes: int) -> str:
    """Formats bytes into human-readable size string."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"


def get_file_type_label(extension: str) -> str:
    """Returns user-friendly file type label."""
    ext = extension.lower()
    if ext == ".pdf":
        return "PDF Document"
    elif ext in {".jpg", ".jpeg"}:
        return "JPEG Image"
    elif ext == ".png":
        return "PNG Image"
    return "Medical Document"


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY"))
    }


@app.post("/api/analyze-report", response_model=ReportResponse)
@app.post("/api/analyze", response_model=ReportResponse)
async def analyze_report_endpoint(file: UploadFile = File(...)):
    """
    Validates, extracts text from PDF/Image, and generates a patient-friendly AI analysis.
    """
    # 1. Validate file presence
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was provided for analysis."
        )

    # 2. Validate file extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Please upload a PDF, JPG, JPEG, or PNG document."
        )

    # 3. Read and validate file size
    try:
        file_bytes = await file.read()
    except Exception as e:
        logger.error("Failed to read uploaded file: %s", e)
        raise HTTPException(
            status_code=400,
            detail="Failed to read the uploaded file data."
        )

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is completely empty."
        )

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="The file exceeds the maximum allowed size of 15 MB."
        )

    # 4. Extract text from PDF or Image
    try:
        if ext == ".pdf":
            raw_text = extract_text_from_pdf(file_bytes)
        else:
            mime = file.content_type if file.content_type and "image" in file.content_type else f"image/{ext.lstrip('.')}"
            raw_text = extract_text_from_image(file_bytes, mime_type=mime)

        cleaned_text = clean_text(raw_text)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Extraction error: %s", e)
        raise HTTPException(
            status_code=400,
            detail=f"Failed to read or parse document: {str(e)}"
        )

    if not cleaned_text or len(cleaned_text.strip()) < 15:
        raise HTTPException(
            status_code=400,
            detail="No readable medical text could be extracted from this document. Please verify the document contains legible text or try uploading a clearer image/PDF."
        )

    # 5. Generate AI analysis
    try:
        analysis_report = analyze_medical_text(cleaned_text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        logger.error("AI service error during report analysis: %s", e)
        raise HTTPException(
            status_code=503,
            detail=f"AI analysis service temporarily unavailable: {str(e)}"
        )
    except Exception as e:
        logger.error("Unexpected error during report analysis: %s", e)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while analyzing the medical report."
        )

    # 6. Construct full response
    return ReportResponse(
        filename=file.filename,
        file_type=get_file_type_label(ext),
        file_size=format_file_size(len(file_bytes)),
        analyzed_at=datetime.now().strftime("%I:%M %p"),
        extracted_text=cleaned_text,
        overview=analysis_report.overview,
        summary=analysis_report.summary,
        important_findings=analysis_report.important_findings,
        key_values=analysis_report.key_values,
        what_this_means=analysis_report.what_this_means,
        doctor_questions=analysis_report.doctor_questions,
    )


@app.post("/api/chat-report", response_model=ChatbotResponseSchema)
@app.post("/api/chat", response_model=ChatbotResponseSchema)
async def chat_report_endpoint(request: ChatRequest):
    """
    Answers a patient question about their uploaded report using the AI Chatbot module.
    """
    if not request.user_question or not request.user_question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    try:
        response = answer_medical_question(
            report_text=request.report_text,
            user_question=request.user_question,
            conversation_history=request.conversation_history,
        )
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        logger.error("Chatbot AI service error: %s", e)
        raise HTTPException(
            status_code=503,
            detail=f"Chatbot service unavailable: {str(e)}"
        )
    except Exception as e:
        logger.error("Unexpected error in chat endpoint: %s", e)
        raise HTTPException(
            status_code=500,
            detail="An error occurred while answering your question."
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
