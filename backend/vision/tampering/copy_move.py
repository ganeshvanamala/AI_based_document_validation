import cv2
import numpy as np
from typing import Optional
from .schemas import TamperingSignal

class CopyMoveAnalyzer:
    """Phase 7 - Copy-Move Detection"""
    
    def __init__(self):
        self.orb = cv2.ORB_create(nfeatures=1500)
        self.matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)

    def analyze(self, image_path: str) -> Optional[TamperingSignal]:
        try:
            img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
            if img is None: return None
            
            kp, des = self.orb.detectAndCompute(img, None)
            if des is None or len(kp) < 20:
                return None

            matches = self.matcher.knnMatch(des, des, k=2)
            
            good_matches = []
            for m, n in matches:
                if m.distance < 0.7 * n.distance:
                    pt1 = np.array(kp[m.queryIdx].pt)
                    pt2 = np.array(kp[m.trainIdx].pt)
                    dist = np.linalg.norm(pt1 - pt2)
                    if dist > 50: # Physically distant
                        good_matches.append(m)

            if len(good_matches) > 20:
                return TamperingSignal(
                    type="copy_move_forgery",
                    severity="HIGH",
                    confidence=min(0.95, 0.5 + (len(good_matches) / 100)),
                    reason=f"Detected {len(good_matches)} candidate duplicated regions (possible cloning)."
                )
            elif len(good_matches) > 10:
                return TamperingSignal(
                    type="copy_move_forgery",
                    severity="MEDIUM",
                    confidence=0.65,
                    reason=f"Detected {len(good_matches)} candidate duplicated regions."
                )
        except Exception:
            pass
        return None
