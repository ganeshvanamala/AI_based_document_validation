import os
import sys
import json
import cv2
import numpy as np
from PIL import Image

# Add backend to path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from vision.core.normalization import InputNormalizer
from vision.ocr.extractor import OCRExtractor
from vision.classifier.classifier import DocumentClassifier
from vision.tampering.detector import TamperingDetector

def create_synthetic_document(path="dummy_doc.jpg"):
    """Creates a basic synthetic document image for testing."""
    img = np.ones((800, 600, 3), dtype=np.uint8) * 255
    
    # Add text
    cv2.putText(img, "REPUBLIC OF UTOPIA", (100, 80), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
    cv2.putText(img, "PASSPORT", (200, 140), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 0), 3)
    cv2.putText(img, "Name: ARJUN RAO", (50, 250), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
    cv2.putText(img, "DOB: 12-04-2002", (50, 300), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
    cv2.putText(img, "Doc No: P1234567", (50, 350), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
    cv2.putText(img, "Expiry: 12-04-2030", (50, 400), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
    
    # Add a mock "photo" box
    cv2.rectangle(img, (400, 200), (550, 400), (150, 150, 150), -1)
    
    # Save as JPEG with intentional compression to test ELA
    cv2.imwrite(path, img, [cv2.IMWRITE_JPEG_QUALITY, 85])
    
    # Re-open and add some metadata to trigger the metadata detector
    pil_img = Image.open(path)
    exif_dict = pil_img.getexif()
    if exif_dict is not None:
        # 305 is the EXIF tag for Software
        exif_dict[305] = "Adobe Photoshop 2024"
        pil_img.save(path, exif=exif_dict)
        
    return path

def test_pipeline(image_path: str):
    print(f"--- Starting Vision Pipeline Test on {image_path} ---")
    
    # 1. Normalization
    print("\n[1] Running Input Normalizer...")
    normalizer = InputNormalizer(workspace_dir="test_workspace")
    norm_info = normalizer.normalize(image_path, document_id="TEST-001")
    print(json.dumps(norm_info, indent=2))
    
    working_path = norm_info["normalized_path"]

    # 2. OCR Extraction
    print("\n[2] Running OCR Extraction...")
    ocr = OCRExtractor()
    ocr_result = ocr.extract(working_path)
    # Convert Pydantic model to dict for clean printing
    print(json.dumps(ocr_result.model_dump(), indent=2))

    # 3. Document Classification
    print("\n[3] Running Document Classifier...")
    classifier = DocumentClassifier()
    class_result = classifier.classify(ocr_result.raw_text)
    print(json.dumps(class_result.model_dump(), indent=2))

    # 4. Tampering Detection
    print("\n[4] Running Tampering Detector (Metadata, ELA, Noise, Copy-Move)...")
    tampering = TamperingDetector()
    tamp_result = tampering.detect(working_path)
    print(json.dumps(tamp_result.model_dump(), indent=2))
    
    print("\n--- Test Complete ---")

if __name__ == "__main__":
    test_img = "dummy_doc.jpg"
    try:
        # Create a fake document that triggers our software metadata and OCR parsing
        create_synthetic_document(test_img)
        test_pipeline(test_img)
    finally:
        # Cleanup
        if os.path.exists(test_img):
            os.remove(test_img)
        if os.path.exists("test_workspace"):
            for f in os.listdir("test_workspace"):
                os.remove(os.path.join("test_workspace", f))
            os.rmdir("test_workspace")
