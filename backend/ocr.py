"""
OCR Module for MedSimplify
Extracts text from medical images (JPG, JPEG, PNG) using Tesseract or Gemini Vision fallback.
"""

import os
import io
import re
import logging
from typing import Optional
from PIL import Image, ImageOps

logger = logging.getLogger("MedSimplifyOCR")


def extract_text_from_image(file_data: bytes, mime_type: str = "image/png") -> str:
    """
    Extracts text from medical report image bytes.
    First attempts local Tesseract OCR if installed; falls back to Gemini Multimodal Vision.
    """
    if not file_data:
        return ""

    # Attempt 1: Tesseract OCR (if available)
    try:
        import pytesseract

        image = Image.open(io.BytesIO(file_data))
        image = image.convert("L")
        image = ImageOps.autocontrast(image)
        width, height = image.size
        # Resize if small
        if width < 1500 and height < 1500:
            image = image.resize((width * 2, height * 2), Image.Resampling.LANCZOS)

        extracted = pytesseract.image_to_string(image, config="--psm 6")
        if extracted and len(extracted.strip()) > 10:
            return extracted.strip()
    except Exception as e:
        logger.debug("Local Tesseract not available or failed: %s. Using Gemini Vision.", e)

    # Attempt 2: Gemini Vision Multimodal OCR
    return extract_text_via_gemini_vision(file_data, mime_type=mime_type)


def extract_text_via_gemini_vision(file_data: bytes, mime_type: str = "image/png") -> str:
    """
    Extracts text directly from image bytes using Google Gemini Multimodal capabilities.
    """
    from dotenv import load_dotenv
    load_dotenv()
    # Also load from ai_chatbot/.env if present
    from pathlib import Path
    root_env = Path(__file__).resolve().parent.parent / "ai_chatbot" / ".env"
    if root_env.exists():
        load_dotenv(root_env)

    from google import genai
    from google.genai import types

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or not api_key.strip():
        raise ValueError(
            "GEMINI_API_KEY is not set. Please configure GEMINI_API_KEY in your environment or .env file."
        )

    model_name = os.getenv("GEMINI_MODEL", "gemini-flash-lite-latest")
    client = genai.Client(api_key=api_key.strip())

    prompt = (
        "You are an accurate OCR engine for medical documents. "
        "Extract all readable text from this medical report image verbatim, including test names, "
        "numerical values, units, reference ranges, and headers. "
        "If the image is completely blank or contains no legible text, output ABSOLUTELY NOTHING (empty string). "
        "Do NOT add conversational explanations or commentary."
    )

    response = client.models.generate_content(
        model=model_name,
        contents=[
            types.Part.from_bytes(data=file_data, mime_type=mime_type),
            prompt
        ],
        config=types.GenerateContentConfig(temperature=0.0)
    )

    raw_text = (response.text or "").strip()

    # Filter out model self-commentary about blankness
    lower_text = raw_text.lower()
    if (
        "no text could be extracted" in lower_text
        or "entirely blank" in lower_text
        or "contains no text" in lower_text
        or "image is blank" in lower_text
    ):
        return ""

    return raw_text
