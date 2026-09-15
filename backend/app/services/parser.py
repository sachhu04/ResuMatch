import io
import fitz  # PyMuPDF
from docx import Document

# Document Ingestion and Text Extraction Service
# Handles multi-format resume documents (PDF, DOCX, DOC, TXT)
# Extracts clean UTF-8 text while preserving document section layout
class DocumentParser:
    @staticmethod
    def parse_pdf(file_bytes: bytes) -> str:
        """
        Parses text from a PDF file using PyMuPDF.
        Maintains basic layout to help with section detection.
        """
        # Initialize in-memory document stream from uploaded raw bytes
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text_content = []
        
        # Iterate over all document pages to extract raw text blocks sequentially
        for page in doc:
            text_content.append(page.get_text("text"))
        
        # Safely release PyMuPDF document handle resources
        doc.close()
        return "\n".join(text_content)

    @staticmethod
    def parse_docx(file_bytes: bytes) -> str:
        """
        Parses text from a DOCX file using python-docx.
        """
        # Load DOCX byte buffer into in-memory Document object
        doc = Document(io.BytesIO(file_bytes))
        text_content = []
        
        # Extract paragraph elements while preserving natural reading order
        for para in doc.paragraphs:
            text_content.append(para.text)
        
        return "\n".join(text_content)

    @staticmethod
    def parse_document(file_bytes: bytes, filename: str) -> str:
        """
        Routes the file to the correct parser based on extension.
        """
        filename_lower = filename.lower()
        
        # Route PDF documents through PyMuPDF text extractor
        if filename_lower.endswith(".pdf"):
            return DocumentParser.parse_pdf(file_bytes)
        # Route Microsoft Word documents through python-docx parser
        elif filename_lower.endswith(".docx") or filename_lower.endswith(".doc"):
            return DocumentParser.parse_docx(file_bytes)
        else:
            # Fallback for plain text files or UTF-8 encoded documents
            try:
                return file_bytes.decode("utf-8")
            except Exception:
                raise ValueError(f"Unsupported file type: {filename}")

