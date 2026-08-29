import pytesseract
import os
import re
from typing import Dict, Any, Optional
from .preprocess import OCRPreprocessor
from .schemas import OCRResult, OCRFields

# Ensure tesseract path is set from env if needed
tesseract_path = os.getenv("TESSERACT_PATH", r"C:\Program Files\Tesseract-OCR\tesseract.exe")
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
            print(f"OCR Exception: {e}")
            # Fallback if OCR fails
            return OCRResult(
                raw_text="",
                fields=OCRFields(),
                confidence=0.0
            )

    def _parse_fields(self, text: str) -> OCRFields:
        """
        Regex and heuristic-based field parsing. 
        """
        fields = OCRFields()
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        # 1. Date matching (DOB / Expiry)
        date_pattern = r'\b(\d{2}[/-]\d{2}[/-]\d{4})\b'
        dates = re.findall(date_pattern, text)
        if dates:
            dates = sorted(dates, key=lambda d: d.replace('-', '/'))
            if len(dates) >= 1:
                fields.date_of_birth = dates[0]
            if len(dates) >= 2:
                fields.expiry_date = dates[-1]

        # 2. Document Number (Passport, Aadhaar with spaces, PAN, etc.)
        # Matches 8-12 alphanumeric OR Aadhaar format (1234 5678 9012)
        doc_num_pattern = r'\b([A-Z0-9]{8,12})\b|\b(\d{4}\s\d{4}\s\d{4})\b'
        for match in re.findall(doc_num_pattern, text):
            candidate = match[0] or match[1]
            if any(c.isdigit() for c in candidate):
                fields.document_number = candidate
                break

        # 3. Name Heuristic
        # Look for explicit "Name" labels first
        for i, line in enumerate(lines):
            if "name" in line.lower() and len(line) > 5:
                # e.g., "Name: Arjun Rao" -> "Arjun Rao"
                clean_name = re.sub(r'(?i)name[:\-\s]*', '', line).strip()
                if clean_name:
                    fields.name = clean_name
                    break
                    
        # If no explicit label, guess the name (often a line with 2-3 capitalized words, no numbers)
        if not fields.name:
            for line in lines:
                # Match 2 to 4 words, alphabetic only, title cased or upper cased
                if re.match(r'^([A-Z][a-zA-Z\.]*\s+){1,3}[A-Z][a-zA-Z]*$', line):
                    # Filter out common false positives
                    if not any(stop in line.lower() for stop in ['government', 'republic', 'india', 'state', 'department', 'father']):
                        fields.name = line
                        break

        # 4. Nationality Heuristic
        if 'india' in text.lower():
            fields.nationality = 'Indian'

        return fields

# Quick test
if __name__ == "__main__":
    extractor = OCRExtractor()
    # result = extractor.extract("path/to/test.jpg")
    # print(result.json(indent=2))
