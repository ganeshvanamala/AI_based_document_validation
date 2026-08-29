import os
from .schemas import TamperingResult
from .metadata import MetadataAnalyzer
from .ela import ELAAnalyzer
from .noise import NoiseAnalyzer
from .copy_move import CopyMoveAnalyzer

class TamperingDetector:
    """
    Phase 12 - Multi-Signal Tampering Result.
    Aggregates independent forensic signals.
    """
    def __init__(self):
        self.metadata = MetadataAnalyzer()
        self.ela = ELAAnalyzer()
        self.noise = NoiseAnalyzer()
        self.copy_move = CopyMoveAnalyzer()

    def detect(self, image_path: str) -> TamperingResult:
        if not os.path.exists(image_path):
            return TamperingResult(status="ANALYSIS_ERROR", confidence=0.0, signals=[], limitations=["File not found"])

        signals = []
        
        meta = self.metadata.analyze(image_path)
        if meta: signals.append(meta)

        ela = self.ela.analyze(image_path)
        if ela: signals.append(ela)

        noise = self.noise.analyze(image_path)
        if noise: signals.append(noise)

        cmfd = self.copy_move.analyze(image_path)
        if cmfd: signals.append(cmfd)

        # Evidence aggregation
        high_count = sum(1 for s in signals if s.severity == "HIGH")
        medium_count = sum(1 for s in signals if s.severity == "MEDIUM")

        if high_count > 0:
            status = "SUSPICIOUS"
            base_conf = 0.80 + (high_count * 0.05)
        elif medium_count > 0:
            status = "SUSPICIOUS"
            base_conf = 0.60 + (medium_count * 0.05)
        elif len(signals) == 0:
            status = "GENUINE / NO SUSPICIOUS SIGNAL"
            base_conf = 0.85
        else:
            status = "INSUFFICIENT_EVIDENCE"
            base_conf = 0.50

        confidence = round(min(0.98, base_conf), 2)
        
        limitations = [
            "Forensic analysis relies on digital artifacts and cannot definitively prove physical forgery.",
            "Compression anomalies may result from legitimate social media transfer."
        ]

        return TamperingResult(
            status=status,
            confidence=confidence,
            signals=signals,
            limitations=limitations
        )
