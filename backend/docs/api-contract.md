# API Contract

This document defines the REST API contract between the React Frontend and FastAPI Backend.
All responses are `application/json`.

## Base URL
`http://localhost:8000`

---

## 1. Create a New Screening
**POST** `/api/screening`

Initiates a new screening case.

**Request Body**
```json
{}
```

**Response (200 OK)**
```json
{
  "screening_id": "SCR-12345",
  "status": "created",
  "created_at": "2026-08-29T12:00:00Z"
}
```

---

## 2. Upload Documents to Screening
**POST** `/api/screening/{screening_id}/documents`

Upload passport/visa documents as multipart/form-data.

**Request Form Data**
- `passport`: File
- `visa`: File (optional)
- `face_photo`: File (optional)

**Response (202 Accepted)**
```json
{
  "screening_id": "SCR-12345",
  "status": "processing_started"
}
```

---

## 3. Get Screening Details
**GET** `/api/screening/{screening_id}`

Retrieve the full details and current status of a screening.

**Response (200 OK)**
```json
{
  "id": "SCR-12345",
  "person_name": "Arjun Rao",
  "status": "Analysis Complete",
  "risk_score": 72,
  "risk_level": "HIGH",
  "recommendation": "Additional verification required",
  "documents": [],
  "ocr_data": {},
  "validation": [],
  "tampering_signals": {},
  "face_match": {},
  "history": [],
  "relationships": {},
  "intelligence_assessment": {},
  "evidence": []
}
```

---

## 4. Get Identity Profile
**GET** `/api/identity/{identity_id}`

**Response (200 OK)**
```json
{
  "id": "ID-001",
  "name": "Arjun Rao",
  "dob": "2002-04-12",
  "nationality": "Indian",
  "status": "Previously Verified"
}
```

---

## 5. Get Identity History
**GET** `/api/identity/{identity_id}/history`

**Response (200 OK)**
```json
[
  {
    "year": "2024",
    "details": "Name: Arjun Rao\nDOB: 12 Apr 2002"
  }
]
```

---

## 6. Get Identity Relationships
**GET** `/api/identity/{identity_id}/relationships`

**Response (200 OK)**
```json
{
  "current": "Arjun Rao",
  "links": [
    { "from_id": "Arjun Rao", "relation": "Mother", "to_id": "Meena Rao", "conflict": false }
  ]
}
```

---

## 7. Submit Answer to Question
**POST** `/api/screening/{screening_id}/questions/{question_id}`

**Request Body**
```json
{
  "answer": "yes"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "new_risk_score": 38,
  "new_risk_level": "MEDIUM",
  "message": "Risk assessment updated after additional information."
}
```

---

## 8. Get Screening Report
**GET** `/api/screening/{screening_id}/report`

**Response (200 OK)**
Returns similar data to GET `/api/screening/{screening_id}` but formatted for final reporting.
