"""
PDF Text Extraction Module for MedSimplify
Extracts text from PDF documents using PyMuPDF (fitz), with scanned PDF OCR fallback.
"""

import io
import logging
import fitz
from typing import Optional

try:
    from .ocr import extract_text_from_image
except ImportError:
    from ocr import extract_text_from_image

logger = logging.getLogger("MedSimplifyPDFExtractor")


def extract_text_from_pdf(file_data: bytes) -> str:
    """
    Extracts text from PDF file bytes.
    If the PDF is a scanned document (contains no selectable text), renders pages
    to images and extracts text via OCR.
    """
    if not file_data:
        return ""

    try:
        pdf_document = fitz.open(stream=file_data, filetype="pdf")
    except Exception as e:
        logger.error("Failed to open PDF stream: %s", e)
        raise ValueError(f"Invalid or corrupted PDF file: {str(e)}") from e

    extracted_pages = []
    total_pages = len(pdf_document)

    if total_pages == 0:
        pdf_document.close()
        return ""

    has_digital_text = False
    for page_idx in range(total_pages):
        page = pdf_document[page_idx]
        text = page.get_text()
        if text and len(text.strip()) > 10:
            has_digital_text = True
            extracted_pages.append(text.strip())

    # If digital text was extracted across the document, return it
    if has_digital_text and extracted_pages:
        pdf_document.close()
        return "\n\n".join(extracted_pages).strip()

    # If no digital text found (scanned PDF), perform OCR on each page
    logger.info("PDF appears to be scanned image. Running OCR on pages...")
    ocr_pages = []
    for page_idx in range(min(total_pages, 10)):  # Process up to 10 pages for safety
        page = pdf_document[page_idx]
        # Render page to high-res pixmap
        pix = page.get_pixmap(dpi=200)
        img_bytes = pix.tobytes(output="png")
        page_text = extract_text_from_image(img_bytes, mime_type="image/png")
        if page_text:
            ocr_pages.append(page_text)

    pdf_document.close()
    return "\n\n".join(ocr_pages).strip()
