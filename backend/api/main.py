from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime
import uuid

from .schemas import (
    ScreeningResponse, 
    DocumentUploadResponse, 
    IdentityProfileResponse,
    HistoryItem,
    RelationshipResponse,
    QuestionAnswer,
    QuestionResponse,
    FullScreeningDetails
)
from .database import db_layer

app = FastAPI(
    title="IdentityGuard AI Backend",
    description="API for the Identity and Document Screening System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "IdentityGuard AI Backend is running"}

@app.post("/api/screening", response_model=ScreeningResponse)
async def create_screening():
    screening_id = f"SCR-{uuid.uuid4().hex[:6].upper()}"
    
    # Store in DB (Mock or Atlas)
    await db_layer.create_screening(screening_id, {
        "status": "created",
        "created_at": datetime.now()
    })
    
    return ScreeningResponse(
        screening_id=screening_id,
        status="created",
        created_at=datetime.now()
    )

@app.post("/api/screening/{screening_id}/documents", response_model=DocumentUploadResponse)
async def upload_documents(
    screening_id: str, 
    passport: UploadFile = File(...), 
    visa: Optional[UploadFile] = File(None),
    face_photo: Optional[UploadFile] = File(None)
):
    # Here we would call the Service Layer to process files and send to Vision module
    # e.g., await DocumentService.process(screening_id, passport, visa, face_photo)
    return DocumentUploadResponse(
        screening_id=screening_id,
        status="processing_started"
    )

@app.get("/api/screening/{screening_id}", response_model=FullScreeningDetails)
async def get_screening(screening_id: str):
    # Here we would orchestrate calls via ScreeningService
    # For now, returning mock structure to satisfy contract
    return FullScreeningDetails(
        id=screening_id,
        person_name="Arjun Rao (Mock API)",
        status="Analysis Complete",
        risk_score=72,
        risk_level="HIGH",
        recommendation="Additional verification required"
    )

@app.get("/api/identity/{identity_id}", response_model=IdentityProfileResponse)
async def get_identity(identity_id: str):
    return IdentityProfileResponse(
        id=identity_id,
        name="Arjun Rao",
        dob="2002-04-12",
        nationality="Indian",
        status="Previously Verified"
    )

@app.get("/api/identity/{identity_id}/history", response_model=List[HistoryItem])
async def get_identity_history(identity_id: str):
    return [
        HistoryItem(year="2024", details="Name: Arjun Rao\nDOB: 12 Apr 2002")
    ]

@app.get("/api/identity/{identity_id}/relationships", response_model=RelationshipResponse)
async def get_identity_relationships(identity_id: str):
    return RelationshipResponse(
        current="Arjun Rao",
        links=[
            {"from_id": "Arjun Rao", "relation": "Mother", "to_id": "Meena Rao", "conflict": False}
        ]
    )

@app.post("/api/screening/{screening_id}/questions/{question_id}", response_model=QuestionResponse)
async def answer_question(screening_id: str, question_id: str, payload: QuestionAnswer):
    # Here we would call QuestionService to recalculate risk
    return QuestionResponse(
        success=True,
        new_risk_score=38,
        new_risk_level="MEDIUM",
        message="Risk assessment updated after additional information."
    )

@app.get("/api/screening/{screening_id}/report", response_model=FullScreeningDetails)
async def get_report(screening_id: str):
    return await get_screening(screening_id)
