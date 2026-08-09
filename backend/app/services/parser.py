import io
import fitz  # PyMuPDF
from docx import Document

class DocumentParser:
    @staticmethod
    def parse_pdf(file_bytes: bytes) -> str:
        """
        Parses text from a PDF file using PyMuPDF.
        Maintains basic layout to help with section detection.
        """
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text_content = []
        for page in doc:
            text_content.append(page.get_text("text"))
        
        doc.close()
        return "\n".join(text_content)

    @staticmethod
    def parse_docx(file_bytes: bytes) -> str:
        """
        Parses text from a DOCX file using python-docx.
        """
        doc = Document(io.BytesIO(file_bytes))
        text_content = []
        for para in doc.paragraphs:
            text_content.append(para.text)
        
        return "\n".join(text_content)

    @staticmethod
    def parse_document(file_bytes: bytes, filename: str) -> str:
        """
        Routes the file to the correct parser based on extension.
        """
        filename_lower = filename.lower()
        if filename_lower.endswith(".pdf"):
            return DocumentParser.parse_pdf(file_bytes)
        elif filename_lower.endswith(".docx") or filename_lower.endswith(".doc"):
            return DocumentParser.parse_docx(file_bytes)
        else:
            # Fallback for plain text if needed
            try:
                return file_bytes.decode("utf-8")
            except Exception:
                raise ValueError(f"Unsupported file type: {filename}")
