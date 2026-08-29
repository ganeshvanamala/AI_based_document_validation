import os
import re
import json
import pytesseract
import google.generativeai as genai
from PIL import Image
from typing import Dict, Any, Optional
from dotenv import load_dotenv

from .preprocess import OCRPreprocessor
from .schemas import OCRResult, OCRFields

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# Configure Tesseract
tesseract_path = os.getenv("TESSERACT_PATH", r"C:\Program Files\Tesseract-OCR\tesseract.exe")
if tesseract_path and os.path.exists(tesseract_path):
    pytesseract.pytesseract.tesseract_cmd = tesseract_path

class OCRExtractor:
    """
    Extracts structured data and raw text from document images using a Hybrid approach 
    (Gemini Multimodal LLM as primary, Tesseract as fallback).
    """
    def __init__(self):
        self.preprocessor = OCRPreprocessor()
        self.model = genai.GenerativeModel('gemini-3.6-flash') if api_key else None

    def extract(self, image_path: str) -> OCRResult:
        """
        Runs both Gemini and Tesseract, merging the results for maximum accuracy.
        """
        gemini_result = self._extract_gemini(image_path)
        tesseract_result = self._extract_tesseract(image_path)

        # Merge strategy: Gemini is primary, Tesseract is fallback
        merged_fields = OCRFields()
        
        # Helper to pick the best value
        def pick_best(field_name: str) -> Optional[str]:
            gem_val = getattr(gemini_result.fields, field_name)
            tess_val = getattr(tesseract_result.fields, field_name)
            if gem_val and str(gem_val).strip() and str(gem_val).lower() != "not found" and str(gem_val).lower() != "null":
                return gem_val
            return tess_val

        merged_fields.name = pick_best("name")
        merged_fields.date_of_birth = pick_best("date_of_birth")
        merged_fields.document_number = pick_best("document_number")
        merged_fields.expiry_date = pick_best("expiry_date")
        merged_fields.nationality = pick_best("nationality")
        merged_fields.gender = pick_best("gender")

        # Combine raw text (useful for debugging and evidence)
        combined_raw = f"--- GEMINI ---\n{gemini_result.raw_text}\n\n--- TESSERACT ---\n{tesseract_result.raw_text}"

        # Boost confidence if both extracted successfully
        final_conf = max(gemini_result.confidence, tesseract_result.confidence)

        return OCRResult(
            raw_text=combined_raw,
            fields=merged_fields,
            confidence=final_conf
        )

    def _extract_gemini(self, image_path: str) -> OCRResult:
        if not self.model:
            return self._fallback_result()
        try:
            image = Image.open(image_path)
            prompt = """
            You are an expert document analyzer. 
            Analyze this identity document (e.g., Aadhaar, Passport) and extract the following details.
            If the text is in Hindi or another language, try to read the English version. If there is no English version, translate it to English.
            
            Return the output strictly in the following JSON format:
            {
                "raw_text": "A full, clean string containing all English text found on the document.",
                "name": "Full Name",
                "date_of_birth": "DD/MM/YYYY",
                "document_number": "ID Number (with spaces if applicable)",
                "expiry_date": "DD/MM/YYYY or null if not present",
                "nationality": "Nationality or 'Indian'",
                "gender": "Male or Female or Transgender"
            }
            """
            response = self.model.generate_content(
                [prompt, image],
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.0
                )
            )
            data = json.loads(response.text)
            fields = OCRFields(
                name=data.get("name"),
                date_of_birth=data.get("date_of_birth"),
                document_number=data.get("document_number"),
                expiry_date=data.get("expiry_date"),
                nationality=data.get("nationality"),
                gender=data.get("gender")
            )
            return OCRResult(raw_text=data.get("raw_text", ""), fields=fields, confidence=0.98)
        except Exception as e:
            print(f"Gemini OCR Exception: {e}")
            return self._fallback_result()

    def _extract_tesseract(self, image_path: str) -> OCRResult:
        try:
            processed_img = self.preprocessor.preprocess(image_path)
            ocr_data = pytesseract.image_to_data(processed_img, output_type=pytesseract.Output.DICT)
            raw_text = pytesseract.image_to_string(processed_img)
            raw_text = self._clean_text(raw_text)

            confidences = [int(c) for c in ocr_data['conf'] if int(c) != -1]
            avg_conf = sum(confidences) / len(confidences) if confidences else 0.0
            confidence_score = round(avg_conf / 100.0, 2)

            fields = self._parse_tesseract_fields(raw_text)
            return OCRResult(raw_text=raw_text.strip(), fields=fields, confidence=confidence_score)
        except Exception as e:
            print(f"Tesseract OCR Exception: {e}")
            return self._fallback_result()

    def _parse_tesseract_fields(self, text: str) -> OCRFields:
        fields = OCRFields()
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        # 1. Date matching
        dates = re.findall(r'\b(\d{2}[/-]\d{2}[/-]\d{4})\b', text)
        if dates:
            fields.date_of_birth = dates[0]
            if len(dates) >= 2:
                fields.expiry_date = dates[-1]

        # 2. Document Number
        for match in re.findall(r'\b([A-Z0-9]{8,12})\b|\b(\d{4}\s\d{4}\s\d{4})\b', text):
            candidate = match[0] or match[1]
            if any(c.isdigit() for c in candidate):
                fields.document_number = candidate
                break

        # 3. Name Heuristic
        for i, line in enumerate(lines):
            if "name" in line.lower():
                clean_name = re.sub(r'(?i).*name[:\-\s]*', '', line).strip()
                if len(clean_name) > 2 and re.match(r'^[a-zA-Z\s\.]+$', clean_name):
                    fields.name = clean_name
                    break
                found_name = False
                for offset in range(1, 4):
                    if i + offset < len(lines):
                        candidate = lines[i+offset].strip()
                        if len(candidate) > 2 and "dob" not in candidate.lower() and "year" not in candidate.lower():
                            if re.match(r'^[a-zA-Z\s\.]+$', candidate):
                                fields.name = candidate
                                found_name = True
                                break
                if found_name:
                    break

        if not fields.name:
            for line in lines:
                if re.match(r'^([A-Z][a-zA-Z\.]*\s+){1,3}[A-Z][a-zA-Z]*$', line):
                    if not any(stop in line.lower() for stop in ['government', 'republic', 'india', 'state', 'department', 'father']):
                        fields.name = line
                        break

        # 4. Nationality
        if 'india' in text.lower():
            fields.nationality = 'Indian'

        # 5. Gender
        for line in lines:
            lower_line = line.lower()
            if "female" in lower_line or re.search(r'\b(f)\b', lower_line):
                fields.gender = "Female"
                break
            elif "male" in lower_line or "purush" in lower_line or re.search(r'\b(m)\b', lower_line):
                fields.gender = "Male"
                break

        return fields

    def _clean_text(self, text: str) -> str:
        clean = "".join([c for c in text if ord(c) < 128])
        return re.sub(r'\n{3,}', '\n\n', clean).strip()

    def _fallback_result(self) -> OCRResult:
        return OCRResult(raw_text="", fields=OCRFields(), confidence=0.0)

# Quick test
if __name__ == "__main__":
    extractor = OCRExtractor()

    # result = extractor.extract("path/to/test.jpg")
    # print(result.json(indent=2))
