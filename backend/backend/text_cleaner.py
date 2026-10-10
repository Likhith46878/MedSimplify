def clean_text(text: str) -> str:
    """
    Clean extracted PDF/OCR text without changing
    medical values or medical wording.
    """

    # Replace tabs with spaces
    text = text.replace("\t", " ")

    # Remove excessive blank lines
    lines = text.splitlines()
    cleaned_lines = []

    for line in lines:
        line = line.strip()

        if line:
            cleaned_lines.append(line)

    # Keep useful line structure
    text = "\n".join(cleaned_lines)

    return text.strip()