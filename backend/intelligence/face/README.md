# Face Verification Module
Use DeepFace (CPU-first execution, no GPU required).
Use a lightweight model where practical.
Do not implement liveness detection.

Interface should be simple:
`verify_faces(document_image, presented_person_image)`

Return example:
```json
{
    "verified": true,
    "similarity": 0.96,
    "confidence": 0.96
}
```
