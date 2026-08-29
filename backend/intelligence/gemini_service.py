import os
import base64
import json
import requests
from typing import Dict, Any, Optional

class GeminiVisionService:
    """
    Direct REST-based Gemini Vision AI service for document intelligence:
    - High-accuracy OCR & JSON field extraction
    - Document classification
    - Forensic tampering detection
    - Biometric face verification
    """
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

    def _encode_image(self, image_path: str) -> Optional[str]:
        if not os.path.exists(image_path):
            return None
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    def _get_mime_type(self, image_path: str) -> str:
        ext = os.path.splitext(image_path)[1].lower()
        if ext in [".jpg", ".jpeg"]:
            return "image/jpeg"
        elif ext == ".png":
            return "image/png"
        elif ext == ".webp":
            return "image/webp"
        return "image/jpeg"

    def analyze_document_and_face(self, doc_image_path: str, live_image_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Sends the document image (and optional live camera photo) to Gemini Vision.
        Returns extracted fields, document classification, forensic tampering checks, and biometric face match.
        """
        if not self.api_key:
            return {"status": "ERROR", "message": "Gemini API Key not found."}

        doc_b64 = self._encode_image(doc_image_path)
        if not doc_b64:
            return {"status": "ERROR", "message": "Could not read document image."}

        doc_mime = self._get_mime_type(doc_image_path)

        parts = []
        prompt_text = """
You are an expert AI Document and Identity Forensic Screener.
Analyze the provided document image (and live camera selfie if attached) with extreme forensic precision.

Extract all details and return ONLY a valid JSON object matching this exact schema:
{
  "document_type": "Passport" | "Aadhaar Card" | "Driving License" | "Voter ID" | "National ID" | "Unknown Document",
  "fields": {
    "name": "Full name of person exactly as on document, or null",
    "date_of_birth": "YYYY-MM-DD or DD/MM/YYYY or null",
    "document_number": "Identification or passport/id number or null",
    "nationality": "Nationality/Country of document or null",
    "expiry_date": "Expiry date or null",
    "raw_text": "Summary of prominent extracted text"
  },
  "tampering_analysis": {
    "is_suspicious": boolean,
    "overall_severity": "LOW" | "MEDIUM" | "HIGH",
    "signals": [
      {
        "type": "font_inconsistency" | "alignment_anomaly" | "compression_artifact" | "altered_text" | "photo_border_tampering",
        "severity": "LOW" | "MEDIUM" | "HIGH",
        "reason": "Clear explanation of detected visual or font anomaly",
        "confidence": float (0.0 to 1.0)
      }
    ]
  },
  "face_verification": {
    "live_photo_provided": boolean,
    "face_detected_in_document": boolean,
    "face_detected_in_live": boolean,
    "is_match": boolean,
    "match_score": float (0.0 to 100.0),
    "reason": "Detailed biometric comparison between document portrait and live camera face"
  }
}
"""
        parts.append({"text": prompt_text})
        parts.append({
            "inline_data": {
                "mime_type": doc_mime,
                "data": doc_b64
            }
        })

        if live_image_path and os.path.exists(live_image_path):
            live_b64 = self._encode_image(live_image_path)
            if live_b64:
                live_mime = self._get_mime_type(live_image_path)
                parts.append({"text": "Here is the second image: LIVE CAMERA WEBCAM PHOTO taken by applicant."})
                parts.append({
                    "inline_data": {
                        "mime_type": live_mime,
                        "data": live_b64
                    }
                })

        url = f"{self.endpoint}?key={self.api_key}"
        payload = {
            "contents": [{"parts": parts}],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.1
            }
        }

        try:
            response = requests.post(url, json=payload, timeout=25)
            if response.status_code != 200:
                print(f"Gemini API Error {response.status_code}: {response.text}")
                return {"status": "ERROR", "message": f"Gemini API returned status {response.status_code}"}

            res_json = response.json()
            candidates = res_json.get("candidates", [])
            if not candidates:
                return {"status": "ERROR", "message": "No response candidates from Gemini."}

            text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
            parsed_data = json.loads(text_content)
            return {"status": "SUCCESS", "data": parsed_data}

        except Exception as e:
            print(f"Exception during Gemini API call: {e}")
            return {"status": "ERROR", "message": str(e)}
