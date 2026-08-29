import re
from .schemas import DocumentClassification

class DocumentClassifier:
    """
    Lightweight document classification layer based on extracted OCR text.
    Classifies documents into categories like Passport, National ID, Visa, etc.
    """
    
    # Simple keyword-based scoring dictionary
    KEYWORDS = {
        "Passport": ["passport", "republic of", "mrz", "nationality", "passport no", "type p", "code of issuing state"],
        "National ID": ["national identity", "aadhaar", "uidai", "ssn", "social security", "identity card", "id card"],
        "Visa": ["visa", "entries", "issue date", "expiry date", "visa type", "leave to enter"],
        "Driving Licence": ["driver", "driving licence", "driver's license", "vehicle", "dl no"],
        "Permit": ["permit", "residence permit", "work permit", "authorization"],
        "Certificate": ["certificate", "certifies", "university", "degree", "diploma", "birth certificate"]
    }

    def classify(self, raw_text: str) -> DocumentClassification:
        if not raw_text or len(raw_text.strip()) < 10:
            return DocumentClassification(document_type="UNKNOWN", confidence=0.0)

        text_lower = raw_text.lower()
        scores = {doc_type: 0 for doc_type in self.KEYWORDS.keys()}
        
        for doc_type, keywords in self.KEYWORDS.items():
            for kw in keywords:
                # Count occurrences of each keyword
                matches = len(re.findall(r'\b' + re.escape(kw) + r'\b', text_lower))
                scores[doc_type] += matches

        best_match = max(scores.items(), key=lambda x: x[1])
        best_type, best_score = best_match

        if best_score == 0:
            return DocumentClassification(document_type="UNKNOWN", confidence=0.0)

        # Calculate a basic confidence score (maxing at 0.95 for purely keyword-based)
        total_score = sum(scores.values())
        confidence = min(0.95, (best_score / total_score) * 0.8 + (min(best_score, 5) * 0.05))

        if confidence < 0.3:
            return DocumentClassification(document_type="UNKNOWN", confidence=round(confidence, 2))

        return DocumentClassification(document_type=best_type, confidence=round(confidence, 2))
