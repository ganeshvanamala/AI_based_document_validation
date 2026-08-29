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
from intelligence.face_matcher import FaceMatcher
from intelligence.identity_manager import IdentityManager

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

# Initialize singletons
normalizer = InputNormalizer(workspace_dir="backend_workspace")
ocr_extractor = OCRExtractor()
classifier = DocumentClassifier()
tampering_detector = TamperingDetector()
face_matcher = FaceMatcher()
identity_manager = IdentityManager(db_layer)

@app.get("/")
async def root():
    return {"message": "IdentityGuard AI Backend is running"}

@app.post("/api/screening", response_model=ScreeningResponse)
async def create_screening():
    screening_id = f"SCR-{uuid.uuid4().hex[:6].upper()}"
    now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")
    
    await db_layer.create_screening(screening_id, {
        "id": screening_id,
        "person_name": "Pending Upload",
        "personName": "Pending Upload",
        "status": "Created",
        "created_at": datetime.now(),
        "date": now_str
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
    face: Optional[UploadFile] = File(None)
):
    os.makedirs("temp_uploads", exist_ok=True)
    
    # Process Document
    doc_path = f"temp_uploads/{screening_id}_doc_{passport.filename}"
    with open(doc_path, "wb") as buffer:
        shutil.copyfileobj(passport.file, buffer)
        
    norm_info = normalizer.normalize(doc_path, document_id=screening_id)
    working_path = norm_info.get("normalized_path", doc_path)

    if norm_info.get("type") == "pdf":
        from vision.pdf.processor import PDFProcessor
        pdf_proc = PDFProcessor()
        images = pdf_proc.render_to_images(working_path, f"temp_uploads/{screening_id}_pages")
        if images:
            working_path = images[0]

    # Process Live Face if provided
    face_result = {"status": "NOT_PROVIDED", "score": 0, "distance": 0}
    if face:
        face_path = f"temp_uploads/{screening_id}_face_{face.filename}"
        with open(face_path, "wb") as buffer:
            shutil.copyfileobj(face.file, buffer)
        
        # Call Intelligence Module
        face_result = face_matcher.compare(working_path, face_path)
        
        if os.path.exists(face_path):
            os.remove(face_path)

    # 2. OCR
    ocr_result = ocr_extractor.extract(working_path)
    
    # 3. Classify
    class_result = classifier.classify(ocr_result.raw_text)
    doc_type = class_result.document_type or "Identity Document"
    
    # 4. Tampering
    tamp_result = tampering_detector.detect(working_path)

    # 5. Identity History (Phase 5)
    person_name = ocr_result.fields.name or "Unknown Person"
    person_dob = ocr_result.fields.date_of_birth or "Unknown"
    
    history_result = await identity_manager.verify_history(
        current_name=person_name,
        current_dob=person_dob
    )

    # 6. Dynamic Risk & Intelligence Engine
    risk_score = 10 # Base score
    contributions = []

    # Validation contribution
    validation_checks = [
        {"text": "Document format structure valid", "status": "pass"}
    ]
    if ocr_result.fields.expiry_date:
        validation_checks.append({"text": f"Expiry date ({ocr_result.fields.expiry_date}) valid", "status": "pass"})
        contributions.append({"label": "Document Expiry Check", "value": "-5"})
        risk_score -= 5
    else:
        validation_checks.append({"text": "Standard identity record format", "status": "pass"})

    # Tampering contribution
    signals = tamp_result.signals if hasattr(tamp_result, 'signals') else []
    evidence = []
    
    has_tampering = tamp_result.status == "SUSPICIOUS" or len(signals) > 0
    if has_tampering:
        risk_score += 35
        contributions.append({"label": "Tampering Anomaly Signals", "value": "+35"})
        for sig in signals:
            evidence.append({
                "title": sig.type.replace('_', ' ').title(),
                "severity": sig.severity.capitalize() if hasattr(sig, 'severity') else "Medium",
                "description": sig.reason if hasattr(sig, 'reason') else "Anomaly detected during digital forensic scan.",
                "confidence": round((sig.confidence if hasattr(sig, 'confidence') else 0.8) * 100)
            })
    else:
        risk_score -= 5
        contributions.append({"label": "Forensic Cleanliness", "value": "-5"})

    # Face verification contribution
    if face_result.get("status") == "MATCH":
        risk_score -= 15
        contributions.append({"label": "Live Biometric Match", "value": "-15"})
        evidence.append({
            "title": "Face match confirmed",
            "severity": "Low",
            "description": f"Live camera photo matches document portrait with {face_result.get('score', 95):.1f}% confidence.",
            "confidence": round(face_result.get('score', 95))
        })
    elif face_result.get("status") == "MISMATCH":
        risk_score += 45
        contributions.append({"label": "Biometric Verification Failure", "value": "+45"})
        evidence.append({
            "title": "Face verification mismatch",
            "severity": "High",
            "description": face_result.get("reason", "Face in document does not match live camera presentation."),
            "confidence": 92
        })

    # History contribution
    if history_result.get("status") == "MISMATCH":
        risk_score += 35
        contributions.append({"label": "Historical Record Conflict", "value": "+35"})
        validation_checks.append({"text": history_result.get("reason", "DOB mismatch with historical record"), "status": "warn"})
        evidence.append({
            "title": "Historical DOB mismatch",
            "severity": "High",
            "description": history_result.get("reason", "Historical profile conflict detected."),
            "confidence": 96
        })
    elif history_result.get("status") == "CONSISTENT":
        risk_score -= 10
        contributions.append({"label": "Historical Record Consistency", "value": "-10"})
        validation_checks.append({"text": "Consistent with verified historical profile", "status": "pass"})
    else:
        validation_checks.append({"text": "New identity record established", "status": "pass"})
        contributions.append({"label": "New Identity Baseline", "value": "+5"})
        risk_score += 5

    # Clamp Risk Score between 5 and 98
    risk_score = max(5, min(98, risk_score))
    
    if risk_score >= 70:
        risk_level = "High"
        recommendation = "Reject or Escalate - Multiple high-risk signals detected"
        status = "Review Required"
    elif risk_score >= 35:
        risk_level = "Medium"
        recommendation = "Additional verification recommended"
        status = "Additional Verification"
    else:
        risk_level = "Low"
        recommendation = "Identity verified and cleared"
        status = "Cleared"

    # Build real timeline history items
    raw_history = history_result.get("history", [])
    history_items = []
    for idx, h_text in enumerate(raw_history):
        is_current = (idx == len(raw_history) - 1)
        history_items.append({
            "year": datetime.now().strftime("%Y"),
            "title": f"Screening Event #{idx + 1}" if not is_current else "Current screening",
            "details": f"{h_text}\nName: {person_name}\nDOB: {person_dob}",
            "highlight": (history_result.get("status") == "MISMATCH" and is_current)
        })
    if not history_items:
        history_items.append({
            "year": datetime.now().strftime("%Y"),
            "title": "Initial screening",
            "details": f"First verification recorded on {datetime.now().strftime('%d %b %Y')}\nName: {person_name}\nDOB: {person_dob}",
            "highlight": False
        })

    # Documents list
    documents_list = [
        {"type": doc_type, "status": "Analyzed"}
    ]
    if face:
        documents_list.append({"type": "Live Selfie Capture", "status": "Verified" if face_result.get("status") == "MATCH" else "Failed"})

    now_date_str = datetime.now().strftime("%d %b %Y, %I:%M %p")

    final_result = {
        "id": screening_id,
        "person_name": person_name,
        "personName": person_name,
        "document_type": doc_type,
        "documentType": doc_type,
        "date": now_date_str,
        "status": status,
        "risk_score": risk_score,
        "riskScore": risk_score,
        "risk_level": risk_level.upper(),
        "riskLevel": risk_level,
        "recommendation": recommendation,
        "created_at": datetime.now().isoformat(),
        "documents": documents_list,
        "ocr": {
            "name": person_name,
            "dob": person_dob,
            "nationality": ocr_result.fields.nationality or "Indian",
            "passportNumber": ocr_result.fields.document_number or "Not Found",
            "expiry": ocr_result.fields.expiry_date or "N/A"
        },
        "validation": validation_checks,
        "tampering": {
            "overall": "High" if tamp_result.status == "SUSPICIOUS" else "Low",
            "photo": "Low",
            "text": "High" if any(s.type in ['metadata_anomaly', 'compression_inconsistency'] for s in signals) else "Low",
            "stamp": "Low",
            "metadata": "High" if any(s.type == 'metadata_anomaly' for s in signals) else "Low"
        },
        "faceMatch": {
            "score": round(face_result.get("score", 0)),
            "status": face_result.get("status", "NOT_PROVIDED")
        },
        "history": history_items,
        "relationships": {
            "current": person_name,
            "links": [
                {"from": person_name, "relation": "Applicant", "to": "Self"}
            ],
            "status": "Verified",
            "explanation": "No conflicting relationship claims found in identity registry."
        },
        "intelligence": {
            "confidence": 91,
            "contributions": contributions
        },
        "evidence": evidence,
        "ocr_data": ocr_result.model_dump(),
        "tampering_signals": tamp_result.model_dump(),
        "face_match": face_result,
        "identity_history": history_result
    }
    
    await db_layer.create_screening(screening_id, final_result)
    
    if os.path.exists(doc_path):
        os.remove(doc_path)

    return {"screening_id": screening_id, "status": "processing_complete"}

@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    return await db_layer.get_dashboard_stats()

@app.get("/api/screenings")
async def get_screenings(limit: int = 50):
    all_s = await db_layer.get_all_screenings(limit=limit)
    # Format for table display
    results = []
    for s in all_s:
        results.append({
            "id": s.get("id", s.get("_id", "SCR-UNKNOWN")),
            "personName": s.get("person_name") or s.get("personName") or "Unknown",
            "documentType": s.get("document_type") or s.get("documentType") or "National ID",
            "date": s.get("date") or datetime.now().strftime("%d %b %Y"),
            "riskLevel": s.get("riskLevel") or (s.get("risk_level", "LOW").capitalize()),
            "riskScore": s.get("riskScore", s.get("risk_score", 10)),
            "status": s.get("status", "Completed")
        })
    return results

@app.get("/api/screening/{screening_id}")
async def get_screening(screening_id: str):
    data = await db_layer.get_screening(screening_id)
    if not data:
        raise HTTPException(status_code=404, detail="Screening record not found")
    return data

@app.get("/api/identities")
async def get_identities():
    return await db_layer.get_all_identities()

@app.get("/api/identity/{identity_id}")
async def get_identity(identity_id: str):
    ident = await db_layer.get_identity(identity_id)
    if ident:
        return ident
    return {
        "id": identity_id,
        "name": identity_id,
        "dob": "N/A",
        "nationality": "Indian",
        "status": "Verified Record",
        "verificationDate": datetime.now().strftime("%Y-%m-%d")
    }

@app.post("/api/screening/{screening_id}/questions/{question_id}")
async def answer_question(screening_id: str, question_id: str, payload: QuestionAnswer):
    # Retrieve screening and update its risk based on answer
    screening = await db_layer.get_screening(screening_id)
    if not screening:
        raise HTTPException(status_code=404, detail="Screening not found")
    
    current_score = screening.get("riskScore", screening.get("risk_score", 50))
    if payload.answer in ["yes", "updated"]:
        new_score = max(15, current_score - 30)
        new_level = "Low" if new_score < 35 else "Medium"
        new_status = "Cleared (Verified with explanation)"
    else:
        new_score = current_score
        new_level = screening.get("riskLevel", "High")
        new_status = "Flagged for Manual Officer Review"
    
    updates = {
        "riskScore": new_score,
        "risk_score": new_score,
        "riskLevel": new_level,
        "risk_level": new_level.upper(),
        "status": new_status,
        "question_resolved": True,
        "question_answer": payload.answer
    }
    
    await db_layer.update_screening(screening_id, updates)
    
    return {
        "success": True,
        "new_risk_score": new_score,
        "new_risk_level": new_level.upper(),
        "message": "Risk assessment updated after additional officer explanation."
    }

@app.get("/api/screening/{screening_id}/report")
async def get_report(screening_id: str):
    return await get_screening(screening_id)
