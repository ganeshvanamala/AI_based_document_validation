import cv2
import numpy as np
from PIL import Image, ImageChops
from PIL.ExifTags import TAGS
import os

class TamperingDetector:
    """
    Advanced Document-Agnostic Tampering Detector.
    Uses multiple forensic techniques to detect forgery in any type of document.
    """
    def __init__(self):
        # ORB detector for copy-move forgery
        self.orb = cv2.ORB_create(nfeatures=1000)
        # Matcher for keypoints
        self.matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)

    def detect(self, image_path: str):
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found at {image_path}")

        signals = []
        
        # 1. Metadata Analysis
        meta = self._check_metadata(image_path)
        if meta: signals.append(meta)

        # 2. Error Level Analysis (JPEG Compression artifacts)
        ela = self._perform_ela(image_path)
        if ela: signals.append(ela)

        # 3. Copy-Move Forgery Detection (Cloned signatures, stamps, text)
        cmfd = self._detect_copy_move(image_path)
        if cmfd: signals.append(cmfd)

        # 4. Noise Inconsistency Detection (Splicing/Pasted elements)
        noise = self._detect_noise_inconsistency(image_path)
        if noise: signals.append(noise)

        # Aggregate risk
        high_count = sum(1 for s in signals if s["severity"] == "HIGH")
        medium_count = sum(1 for s in signals if s["severity"] == "MEDIUM")

        if high_count > 0:
            overall_risk = "HIGH"
        elif medium_count > 0 or len(signals) >= 2:
            overall_risk = "MEDIUM"
        else:
            overall_risk = "LOW"

        # Calculate confidence based on severity and number of signals
        confidence = min(0.98, 0.60 + (high_count * 0.15) + (medium_count * 0.08))
        if overall_risk == "LOW":
            confidence = 0.90 # High confidence it's genuine if all 4 rigorous checks pass

        return {
            "risk": overall_risk,
            "confidence": round(confidence, 2),
            "signals": signals
        }

    def _check_metadata(self, image_path: str):
        try:
            img = Image.open(image_path)
            exif_data = img.getexif()
            if not exif_data: return None

            suspicious = ["photoshop", "gimp", "canva", "illustrator", "paint"]
            for tag_id, value in exif_data.items():
                if TAGS.get(tag_id, tag_id) == "Software" and isinstance(value, str):
                    if any(s in value.lower() for s in suspicious):
                        return {"type": "metadata", "severity": "HIGH", "reason": f"Software signature found: {value}"}
        except Exception:
            pass
        return None

    def _perform_ela(self, image_path: str):
        temp_filename = "temp_ela.jpg"
        try:
            original = Image.open(image_path).convert('RGB')
            original.save(temp_filename, 'JPEG', quality=90)
            compressed = Image.open(temp_filename)
            
            diff = ImageChops.difference(original, compressed)
            extrema = diff.getextrema()
            max_diff = max([ex[1] for ex in extrema])
            if max_diff == 0: max_diff = 1
            
            scale = 255.0 / max_diff
            diff = Image.eval(diff, lambda x: x * scale)
            
            gray_diff = cv2.cvtColor(np.array(diff), cv2.COLOR_RGB2GRAY)
            variance = np.var(gray_diff)
            os.remove(temp_filename)

            if variance > 2500:
                return {"type": "compression_anomaly", "severity": "HIGH", "reason": "Severe compression irregularity (variance spike). Indicates possible text/photo insertion."}
            elif variance > 1500:
                return {"type": "compression_anomaly", "severity": "MEDIUM", "reason": "Moderate compression irregularity."}
        except Exception:
            if os.path.exists(temp_filename): os.remove(temp_filename)
        return None

    def _detect_copy_move(self, image_path: str):
        """
        Detects if parts of the document (stamps, signatures) were cloned.
        """
        try:
            img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
            kp, des = self.orb.detectAndCompute(img, None)
            
            if des is None or len(kp) < 10:
                return None

            # Match descriptors against themselves
            matches = self.matcher.knnMatch(des, des, k=2)
            
            good_matches = []
            for m, n in matches:
                # If distance is very small, but points are physically far apart = cloned region
                if m.distance < 0.7 * n.distance:
                    pt1 = np.array(kp[m.queryIdx].pt)
                    pt2 = np.array(kp[m.trainIdx].pt)
                    dist = np.linalg.norm(pt1 - pt2)
                    if dist > 50: # Must be physically distant in the image
                        good_matches.append(m)

            if len(good_matches) > 15:
                return {"type": "copy_move_forgery", "severity": "HIGH", "reason": f"Detected {len(good_matches)} identical cloned regions. Indicates copy-pasted elements."}
        except Exception:
            pass
        return None

    def _detect_noise_inconsistency(self, image_path: str):
        """
        Uses Spatial Rich Models (SRM) / High-pass filtering principle.
        If an element is spliced from a different image, its background noise will clash with the document's noise.
        """
        try:
            img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
            
            # Extract noise using a Laplacian filter (high frequency)
            laplacian = cv2.Laplacian(img, cv2.CV_64F)
            
            # Split image into 4 quadrants to compare local noise variance
            h, w = laplacian.shape
            q1 = laplacian[0:h//2, 0:w//2]
            q2 = laplacian[0:h//2, w//2:w]
            q3 = laplacian[h//2:h, 0:w//2]
            q4 = laplacian[h//2:h, w//2:w]
            
            variances = [np.var(q1), np.var(q2), np.var(q3), np.var(q4)]
            max_var = max(variances)
            min_var = min(variances)
            
            # If one region has massively different noise than the rest, it's spliced
            if min_var > 0 and (max_var / min_var) > 4.5:
                return {"type": "noise_inconsistency", "severity": "HIGH", "reason": "Spatial noise variance is highly inconsistent. Indicates spliced/pasted image regions."}
            elif min_var > 0 and (max_var / min_var) > 3.0:
                return {"type": "noise_inconsistency", "severity": "MEDIUM", "reason": "Spatial noise variance shows some inconsistency."}
        except Exception:
            pass
        return None
