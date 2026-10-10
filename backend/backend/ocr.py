from PIL import Image, ImageOps
import pytesseract
from io import BytesIO


def extract_text_from_image(file_data: bytes) -> str:
    # Open image
    image = Image.open(BytesIO(file_data))

    # Convert to grayscale
    image = image.convert("L")

    # Improve contrast
    image = ImageOps.autocontrast(image)

    # Increase image size for better OCR
    width, height = image.size
    image = image.resize((width * 2, height * 2))

    # Extract text using Tesseract
    extracted_text = pytesseract.image_to_string(
        image,
        config="--psm 6"
    )

    return extracted_text.strip()