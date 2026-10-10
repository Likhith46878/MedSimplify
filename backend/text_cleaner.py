"""
Text Cleaning Utilities for MedSimplify
Cleans raw text extracted from PDF and OCR while strictly preserving medical values, units, and ranges.
"""

import re


def clean_text(text: str) -> str:
    """
    Clean extracted PDF/OCR text without modifying medical values or wording.
    """
    if not text:
        return ""

    # Normalize carriage returns and tabs
    text = text.replace("\r\n", "\n").replace("\r", "\n").replace("\t", " ")

    # Remove excessive horizontal spaces while keeping single spaces
    text = re.sub(r"[ \t]+", " ", text)

    # Remove excessive blank lines (more than 2 consecutive newlines)
    text = re.sub(r"\n\s*\n\s*\n+", "\n\n", text)

    # Strip each line
    lines = [line.strip() for line in text.splitlines()]

    # Filter out isolated non-informative punctuation lines
    cleaned_lines = []
    for line in lines:
        if line:
            cleaned_lines.append(line)

    return "\n".join(cleaned_lines).strip()
