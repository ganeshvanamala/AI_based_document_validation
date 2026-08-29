from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ScreeningResponse(BaseModel):
    screening_id: str
    status: str
    created_at: datetime

class QuestionAnswer(BaseModel):
    answer: str

class DocumentUploadResponse(BaseModel):
    screening_id: str
    status: str

# Mock data models for the responses
class IdentityProfileResponse(BaseModel):
    id: str
    name: str
    dob: str
    nationality: str
    status: str

class HistoryItem(BaseModel):
    year: str
    details: str

class RelationshipLink(BaseModel):
    from_id: str
    relation: str
    to_id: str
    conflict: bool

class RelationshipResponse(BaseModel):
    current: str
    links: List[RelationshipLink]

class QuestionResponse(BaseModel):
    success: bool
    new_risk_score: int
    new_risk_level: str
    message: str

class FullScreeningDetails(BaseModel):
    id: str
    person_name: str
    status: str
    risk_score: int
    risk_level: str
    recommendation: str
    documents: List[Dict[str, Any]] = []
    ocr_data: Dict[str, Any] = {}
    validation: List[Dict[str, Any]] = []
    tampering_signals: Dict[str, Any] = {}
    face_match: Dict[str, Any] = {}
    history: List[Dict[str, Any]] = []
    relationships: Dict[str, Any] = {}
    intelligence_assessment: Dict[str, Any] = {}
    evidence: List[Dict[str, Any]] = []
