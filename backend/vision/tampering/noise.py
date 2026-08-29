import cv2
import numpy as np
from typing import Optional
from .schemas import TamperingSignal

class NoiseAnalyzer:
    """Phase 6 - Noise / Resampling Analysis"""
    
    def analyze(self, image_path: str) -> Optional[TamperingSignal]:
        try:
            img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
            if img is None: return None
            
            laplacian = cv2.Laplacian(img, cv2.CV_64F)
            
            h, w = laplacian.shape
            # Split into quadrants to find severe local differences
            quads = [
                laplacian[0:h//2, 0:w//2],
                laplacian[0:h//2, w//2:w],
                laplacian[h//2:h, 0:w//2],
                laplacian[h//2:h, w//2:w]
            ]
            
            variances = [np.var(q) for q in quads]
            max_var = max(variances)
            min_var = min(variances)
            
            if min_var > 0:
                ratio = max_var / min_var
                if ratio > 4.0:
                    return TamperingSignal(
                        type="noise_inconsistency",
                        severity="HIGH",
                        confidence=min(0.9, 0.6 + (ratio / 20)),
                        reason="Spatial noise variance is highly inconsistent, suggesting possible splicing."
                    )
                elif ratio > 2.5:
                    return TamperingSignal(
                        type="noise_inconsistency",
                        severity="MEDIUM",
                        confidence=0.65,
                        reason="Spatial noise variance shows some inconsistency."
                    )
        except Exception:
            pass
        return None
