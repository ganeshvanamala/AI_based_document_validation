from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class TamperingSignal(BaseModel):
    type: str
    severity: str  # "LOW", "MEDIUM", "HIGH"
    confidence: float
    reason: str
    region: Optional[Dict[str, int]] = None  # e.g., {"x": 100, "y": 200, "width": 300, "height": 100}

class TamperingResult(BaseModel):
    status: str  # "GENUINE", "SUSPICIOUS", "INSUFFICIENT_EVIDENCE", "ANALYSIS_ERROR"
    confidence: float
    signals: List[TamperingSignal]
    limitations: List[str]
