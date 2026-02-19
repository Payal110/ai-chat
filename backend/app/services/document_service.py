import io
import PyPDF2
from docx import Document
from fastapi import UploadFile

def extract_text_from_file(file: io.BytesIO, filename: str) -> str:
    """Extract text from PDF, DOCX, or TXT files."""
    extension = filename.split(".")[-1].lower()
    
    if extension == "pdf":
        return _extract_from_pdf(file)
    elif extension == "docx":
        return _extract_from_docx(file)
    elif extension == "txt":
        return _extract_from_txt(file)
    else:
        raise ValueError(f"Unsupported file type: {extension}")

def _extract_from_pdf(file: io.BytesIO) -> str:
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def _extract_from_docx(file: io.BytesIO) -> str:
    doc = Document(file)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

def _extract_from_txt(file: io.BytesIO) -> str:
    return file.read().decode("utf-8")
