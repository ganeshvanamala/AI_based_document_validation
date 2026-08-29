# OCR Module
Use local Tesseract OCR through pytesseract (Windows target).
Do NOT use paid cloud OCR APIs.

Accept an image/PDF-derived image and return structured extracted data.
Example:
```json
{
    "name": "...",
    "date_of_birth": "...",
    "nationality": "...",
    "document_number": "...",
    "expiry_date": "...",
    "raw_text": "..."
}
```
Passport MRZ extraction should be treated as a separate processing step here.
