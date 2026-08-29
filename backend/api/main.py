from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime
import uuid
import os
import shutil

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

# Import Vision modules
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from vision.core.normalization import InputNormalizer
from vision.ocr.extractor import OCRExtractor
from vision.classifier.classifier import DocumentClassifier
from vision.tampering.detector import TamperingDetector

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

# Initialize singletons for vision
normalizer = InputNormalizer(workspace_dir="backend_workspace")
ocr_extractor = OCRExtractor()
classifier = DocumentClassifier()
tampering_detector = TamperingDetector()

@app.get("/")
async def root():
    return {"message": "IdentityGuard AI Backend is running"}

@app.post("/api/screening", response_model=ScreeningResponse)
async def create_screening():
    screening_id = f"SCR-{uuid.uuid4().hex[:6].upper()}"
    
    await db_layer.create_screening(screening_id, {
        "status": "created",
        "created_at": datetime.now()
    })
    
    return ScreeningResponse(
        screening_id=screening_id,
        status="created",
        created_at=datetime.now()
    )

@app.post("/api/screening/{screening_id}/documents")
async def upload_documents(
    screening_id: str, 
    passport: UploadFile = File(...), 
    visa: Optional[UploadFile] = File(None),
    face_photo: Optional[UploadFile] = File(None)
):
    # Save the uploaded passport temporarily
    os.makedirs("temp_uploads", exist_ok=True)
    file_path = f"temp_uploads/{passport.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(passport.file, buffer)
        
    # 1. Normalize
    norm_info = normalizer.normalize(file_path, document_id=screening_id)
    working_path = norm_info.get("normalized_path", file_path)

    # 2. OCR
    ocr_result = ocr_extractor.extract(working_path)
    
    # 3. Classify
    class_result = classifier.classify(ocr_result.raw_text)
    
    # 4. Tampering
    tamp_result = tampering_detector.detect(working_path)

    # Compile the final result for the frontend
    final_result = {
        "id": screening_id,
        "person_name": ocr_result.fields.name or "Unknown Person",
        "status": "Analysis Complete",
        "risk_score": 85 if tamp_result.status == "SUSPICIOUS" else 20,
        "risk_level": "HIGH" if tamp_result.status == "SUSPICIOUS" else "LOW",
        "recommendation": "Additional verification required" if tamp_result.status == "SUSPICIOUS" else "Approve",
        "ocr_data": ocr_result.model_dump(),
        "tampering_signals": tamp_result.model_dump(),
        "document_type": class_result.document_type
    }
    
    # Save to mock DB so the GET endpoint can retrieve it
    await db_layer.create_screening(screening_id, final_result)
    
    # Cleanup temp upload
    if os.path.exists(file_path):
        os.remove(file_path)

    return {"screening_id": screening_id, "status": "processing_complete"}

@app.get("/api/screening/{screening_id}")
async def get_screening(screening_id: str):
    data = await db_layer.get_screening(screening_id)
    if data:
        # If it was processed by the AI, return that data mapped to FullScreeningDetails structure
        # (This is a simplified mapping for the prototype)
        return data
        
    # Fallback to mock data if not found
    return {
        "id": screening_id,
        "person_name": "Arjun Rao (Mock API)",
        "status": "Analysis Complete",
        "risk_score": 72,
        "risk_level": "HIGH",
        "recommendation": "Additional verification required"
    }

# Mock endpoints for the rest of the app
@app.get("/api/identity/{identity_id}", response_model=IdentityProfileResponse)
async def get_identity(identity_id: str):
    return IdentityProfileResponse(id=identity_id, name="Arjun Rao", dob="2002-04-12", nationality="Indian", status="Previously Verified")

@app.get("/api/identity/{identity_id}/history", response_model=List[HistoryItem])
async def get_identity_history(identity_id: str):
    return [HistoryItem(year="2024", details="Name: Arjun Rao\nDOB: 12 Apr 2002")]

@app.get("/api/identity/{identity_id}/relationships", response_model=RelationshipResponse)
async def get_identity_relationships(identity_id: str):
    return RelationshipResponse(current="Arjun Rao", links=[{"from_id": "Arjun Rao", "relation": "Mother", "to_id": "Meena Rao", "conflict": False}])

@app.post("/api/screening/{screening_id}/questions/{question_id}", response_model=QuestionResponse)
async def answer_question(screening_id: str, question_id: str, payload: QuestionAnswer):
    return QuestionResponse(success=True, new_risk_score=38, new_risk_level="MEDIUM", message="Risk assessment updated after additional information.")

@app.get("/api/screening/{screening_id}/report")
async def get_report(screening_id: str):
    return await get_screening(screening_id)
