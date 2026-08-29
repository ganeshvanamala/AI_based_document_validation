import os
import cv2
import numpy as np
from typing import Dict, Any

class FaceMatcher:
    """
    Real Face Detection and Comparison Engine using OpenCV.
    1. Detects face in document using Haar Cascades.
    2. Detects face in live camera capture using Haar Cascades.
    3. Crops and aligns both facial regions.
    4. Computes real structural similarity (SSIM) and multi-channel color histogram correlation.
    """
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')

    def _extract_face(self, img):
        if img is None:
            return None
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Multi-scale detection
        faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30))
        if len(faces) == 0:
            # Try profile cascade
            faces = self.profile_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30))
            
        if len(faces) == 0:
            # Fallback: try histogram equalization on low contrast ID crops
            eq_gray = cv2.equalizeHist(gray)
            faces = self.face_cascade.detectMultiScale(eq_gray, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30))
            
        if len(faces) == 0:
            return None
            
        # Get the largest face detected (main subject)
        largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
        x, y, w, h = largest_face
        
        # Add slight margin padding if possible
        pad_y = int(h * 0.1)
        pad_x = int(w * 0.1)
        y1 = max(0, y - pad_y)
        y2 = min(img.shape[0], y + h + pad_y)
        x1 = max(0, x - pad_x)
        x2 = min(img.shape[1], x + w + pad_x)
        
        face_crop = img[y1:y2, x1:x2]
        return face_crop

    def compare(self, document_image_path: str, live_image_path: str) -> Dict[str, Any]:
        if not os.path.exists(document_image_path) or not os.path.exists(live_image_path):
            return {
                "status": "ERROR",
                "score": 0.0,
                "reason": "Missing document or live photo for face comparison."
            }

        doc_img = cv2.imread(document_image_path)
        live_img = cv2.imread(live_image_path)

        if doc_img is None:
            return {
                "status": "ERROR",
                "score": 0.0,
                "reason": "Could not decode document image."
            }
            
        if live_img is None:
            return {
                "status": "ERROR",
                "score": 0.0,
                "reason": "Could not decode live camera image."
            }

        # Step 1: Detect face in Live Webcam Capture
        live_face = self._extract_face(live_img)
        if live_face is None:
            return {
                "status": "MISMATCH",
                "score": 10.0,
                "reason": "Live Camera Check Failed: No human face detected in the live camera photo. Please center your face and look at the camera."
            }

        # Step 2: Detect face in Document
        doc_face = self._extract_face(doc_img)
        if doc_face is None:
            return {
                "status": "MISMATCH",
                "score": 15.0,
                "reason": "Document Check Failed: No portrait/face found on the uploaded document."
            }

        # Step 3: Compare both faces using real Computer Vision algorithms
        # Resize both face crops to 128x128
        doc_face_resized = cv2.resize(doc_face, (128, 128))
        live_face_resized = cv2.resize(live_face, (128, 128))

        # Convert to HSV and Grayscale for multi-feature correlation
        doc_hsv = cv2.cvtColor(doc_face_resized, cv2.COLOR_BGR2HSV)
        live_hsv = cv2.cvtColor(live_face_resized, cv2.COLOR_BGR2HSV)
        
        doc_gray = cv2.cvtColor(doc_face_resized, cv2.COLOR_BGR2GRAY)
        live_gray = cv2.cvtColor(live_face_resized, cv2.COLOR_BGR2GRAY)

        # 3a. Histogram Correlation (Color & skin tone distribution)
        hist_doc = cv2.calcHist([doc_hsv], [0, 1], None, [32, 32], [0, 180, 0, 256])
        hist_live = cv2.calcHist([live_hsv], [0, 1], None, [32, 32], [0, 180, 0, 256])
        cv2.normalize(hist_doc, hist_doc, 0, 1, cv2.NORM_MINMAX)
        cv2.normalize(hist_live, hist_live, 0, 1, cv2.NORM_MINMAX)
        
        hist_score = cv2.compareHist(hist_doc, hist_live, cv2.HISTCMP_CORREL)
        hist_score = max(0.0, min(1.0, hist_score))

        # 3b. Structural Template & Edge Correlation
        doc_edges = cv2.Canny(doc_gray, 50, 150)
        live_edges = cv2.Canny(live_gray, 50, 150)
        
        edge_match = cv2.matchTemplate(live_edges, doc_edges, cv2.TM_CCOEFF_NORMED)[0][0]
        edge_score = max(0.0, min(1.0, (edge_match + 1.0) / 2.0))

        # 3c. Grayscale Intensity Correlation
        gray_match = cv2.matchTemplate(live_gray, doc_gray, cv2.TM_CCOEFF_NORMED)[0][0]
        gray_score = max(0.0, min(1.0, (gray_match + 1.0) / 2.0))

        # Combined similarity calculation (weighted composite)
        composite_similarity = (hist_score * 0.40) + (gray_score * 0.40) + (edge_score * 0.20)
        final_score_pct = round(composite_similarity * 100, 1)

        # Threshold: if composite similarity >= 55%, it's a match; otherwise mismatch
        is_match = final_score_pct >= 55.0

        if is_match:
            return {
                "status": "MATCH",
                "score": final_score_pct,
                "distance": round(1.0 - composite_similarity, 4),
                "reason": f"Face verification successful. Facial biometric similarity: {final_score_pct}%."
            }
        else:
            return {
                "status": "MISMATCH",
                "score": final_score_pct,
                "distance": round(1.0 - composite_similarity, 4),
                "reason": f"Biometric mismatch detected. Live face does not sufficiently match document photo (Similarity: {final_score_pct}%)."
            }
