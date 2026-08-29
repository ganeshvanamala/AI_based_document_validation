import fitz  # PyMuPDF
from PIL import Image
import io
import os
import hashlib
from typing import List, Dict, Any

class PDFProcessor:
    """
    Handles PDF input normalization, text extraction, and rendering to images.
    """
    def __init__(self, dpi: int = 300):
        self.dpi = dpi

    def get_metadata(self, file_path: str) -> Dict[str, Any]:
        """Extracts PDF metadata without modifying the original."""
        try:
            doc = fitz.open(file_path)
            meta = doc.metadata
            doc.close()
            return meta
        except Exception as e:
            return {"error": str(e)}

    def extract_text(self, file_path: str) -> str:
        """Extracts embedded selectable text if available."""
        text = ""
        try:
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
            doc.close()
        except Exception:
            pass
        return text

    def render_to_images(self, file_path: str, output_dir: str) -> List[str]:
        """Renders PDF pages to high-quality images for OCR/Forensics."""
        image_paths = []
        try:
            doc = fitz.open(file_path)
            os.makedirs(output_dir, exist_ok=True)
            
            # Use high DPI for better OCR
            zoom = self.dpi / 72.0
            mat = fitz.Matrix(zoom, zoom)
            
            for i, page in enumerate(doc):
                pix = page.get_pixmap(matrix=mat, alpha=False)
                out_path = os.path.join(output_dir, f"page_{i}.png")
                pix.save(out_path)
                image_paths.append(out_path)
            doc.close()
        except Exception as e:
            print(f"Error rendering PDF: {e}")
            
        return image_paths
