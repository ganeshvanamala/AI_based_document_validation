import pytesseract
import os
import re
from typing import Dict, Any, Optional
from .preprocess import OCRPreprocessor
from .schemas import OCRResult, OCRFields

# Ensure tesseract path is set from env if needed
tesseract_path = os.getenv("TESSERACT_PATH")
if tesseract_path and os.path.exists(tesseract_path):
    pytesseract.pytesseract.tesseract_cmd = tesseract_path

class OCRExtractor:
    """
    Extracts structured data and raw text from document images.
    """
    def __init__(self):
        self.preprocessor = OCRPreprocessor()

    def extract(self, image_path: str) -> OCRResult:
        """
        Preprocesses image, runs OCR, and attempts to extract fields.
        Returns a structured OCRResult.
        """
        try:
            processed_img = self.preprocessor.preprocess(image_path)
            
            # Extract raw text and data dictionary
            ocr_data = pytesseract.image_to_data(processed_img, output_type=pytesseract.Output.DICT)
            raw_text = pytesseract.image_to_string(processed_img)

            # Calculate average confidence
            confidences = [int(c) for c in ocr_data['conf'] if int(c) != -1]
            avg_conf = sum(confidences) / len(confidences) if confidences else 0.0
            confidence_score = round(avg_conf / 100.0, 2)

            # Try to parse fields
            fields = self._parse_fields(raw_text)

            return OCRResult(
                raw_text=raw_text.strip(),
                fields=fields,
                confidence=confidence_score
            )
        except Exception as e:
            # Fallback if OCR fails
            return OCRResult(
                raw_text="",
                fields=OCRFields(),
                confidence=0.0
            )

    def _parse_fields(self, text: str) -> OCRFields:
        """
        Simple regex-based field parsing. 
        In production, this would use layout LM or complex regex/MRZ parsing.
        """
        fields = OCRFields()
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        # Basic Date matching (DD/MM/YYYY or DD-MM-YYYY)
        date_pattern = r'\b(\d{2}[/-]\d{2}[/-]\d{4})\b'
        dates = re.findall(date_pattern, text)
        
        # Sort dates assuming earlier date is DOB and later date is Expiry
        if dates:
            dates = sorted(dates, key=lambda d: d.replace('-', '/'))
            if len(dates) >= 1:
                fields.date_of_birth = dates[0]
            if len(dates) >= 2:
                fields.expiry_date = dates[-1]

        # Basic Document Number matching (e.g. Passport P1234567, Aadhar 1234 5678 9012)
        doc_num_pattern = r'\b([A-Z0-9]{8,12})\b'
        doc_nums = re.findall(doc_num_pattern, text)
        if doc_nums:
            # Filter out dates or purely alphabetic words
            candidates = [n for n in doc_nums if any(c.isdigit() for c in n)]
            if candidates:
                fields.document_number = candidates[0]

        return fields

# Quick test
if __name__ == "__main__":
    extractor = OCRExtractor()
    # result = extractor.extract("path/to/test.jpg")
    # print(result.json(indent=2))
