import cv2
import numpy as np
from PIL import Image, ImageChops
import os
from typing import Optional
from .schemas import TamperingSignal

class ELAAnalyzer:
    """Phase 5 - Error Level / Compression Analysis"""
    
    def __init__(self, quality=90, variance_threshold=2000):
        self.quality = quality
        self.variance_threshold = variance_threshold

    def analyze(self, image_path: str) -> Optional[TamperingSignal]:
        temp_filename = "temp_ela_analysis.jpg"
        try:
            original = Image.open(image_path).convert('RGB')
            original.save(temp_filename, 'JPEG', quality=self.quality)
            compressed = Image.open(temp_filename)
            
            diff = ImageChops.difference(original, compressed)
            extrema = diff.getextrema()
            max_diff = max([ex[1] for ex in extrema]) if extrema else 1
            if max_diff == 0: max_diff = 1
            
            scale = 255.0 / max_diff
            diff = Image.eval(diff, lambda x: x * scale)
            
            gray_diff = cv2.cvtColor(np.array(diff), cv2.COLOR_RGB2GRAY)
            variance = np.var(gray_diff)
            
            os.remove(temp_filename)

            if variance > self.variance_threshold:
                return TamperingSignal(
                    type="compression_inconsistency",
                    severity="HIGH",
                    confidence=min(0.95, 0.5 + (variance / 10000)),
                    reason=f"Significant compression irregularity detected (variance: {variance:.2f})."
                )
            elif variance > (self.variance_threshold * 0.6):
                return TamperingSignal(
                    type="compression_inconsistency",
                    severity="MEDIUM",
                    confidence=0.70,
                    reason=f"Moderate compression irregularity detected."
                )
        except Exception:
            if os.path.exists(temp_filename):
                os.remove(temp_filename)
        return None
