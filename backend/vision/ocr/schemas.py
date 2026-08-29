from pydantic import BaseModel
from typing import Optional, Dict

class OCRFields(BaseModel):
    name: Optional[str] = None
    date_of_birth: Optional[str] = None
    document_number: Optional[str] = None
    expiry_date: Optional[str] = None
    nationality: Optional[str] = None

class OCRResult(BaseModel):
    raw_text: str
    fields: OCRFields
    confidence: float
