# Intelligence & Risk Module (Logic Engineer)

**Owner:** Person 4
**Tech Stack:** Python, DeepFace, custom rule engines

## Responsibilities
This directory is the "brain" of the application that makes the final decision.
- `face_verification.py`: Use DeepFace to compare the extracted document face with the presented live face.
- `validation_rules.py`: Check if the extracted dates are valid, if the document has expired, etc.
- `relationship_checker.py`: Logic to query the database and find contradictions in family trees.
- `risk_engine.py`: The weighted scoring algorithm that takes all inputs and outputs a score out of 100.

Your goal is to write functions that take the raw data extracted by the Vision module and the historical data from the Database, apply logic, and return a final risk assessment.
