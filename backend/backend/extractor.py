import fitz


def extract_text_from_pdf(file_data: bytes) -> str:
    pdf_document = fitz.open(stream=file_data, filetype="pdf")

    extracted_text = ""

    for page in pdf_document:
        extracted_text += page.get_text()

    pdf_document.close()

    return extracted_text.strip()




   