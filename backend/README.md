# Backend Service - IdentityGuard AI

This is the backend service for the AI-Based Fake Identity & Document Screening System.

## Team Segregation
To move fast for the hackathon, this backend is divided into three isolated domains:

1. **`api/` (Person 2):** FastAPI server, routing, and MongoDB Atlas connections.
2. **`vision/` (Person 3):** OpenCV, Tesseract OCR, and document manipulation detection.
3. **`intelligence/` (Person 4):** DeepFace verification, relationship graph checking, and the core risk scoring engine.

*(Person 1 is handling the React frontend in the root directory).*

## Next Steps
- Backend lead: Install FastAPI (`pip install fastapi uvicorn motor`) and create `api/main.py`.
- Vision engineer: Install OpenCV/Tesseract and create `vision/ocr_engine.py`.
- Intelligence engineer: Install DeepFace and create `intelligence/face_verification.py`.
