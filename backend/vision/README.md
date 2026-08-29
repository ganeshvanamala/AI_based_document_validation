# Computer Vision & OCR Module (AI/ML Engineer)

**Owner:** Person 3
**Tech Stack:** Python, OpenCV, Tesseract OCR, PyMuPDF, Pillow

## Responsibilities
This directory contains the scripts for analyzing the physical document.
- `ocr_engine.py`: Extract text from identity documents using Tesseract.
- `mrz_parser.py`: Parse the Machine Readable Zone on passports.
- `tampering_detection.py`: OpenCV scripts to detect copy-paste marks, mismatched fonts, or metadata anomalies.
- `face_extractor.py`: Detect and crop the face from the document image.

Your goal is to write functions that take an image/PDF path as input and return structured JSON data (e.g., extracted text, tampering confidence score, cropped face image).
