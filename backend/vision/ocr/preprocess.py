import cv2
import numpy as np

class OCRPreprocessor:
    """
    Cleans up document images for better OCR results.
    """
    def __init__(self):
        pass

    def preprocess(self, image_path: str) -> np.ndarray:
        """
        Reads image, converts to grayscale, removes noise, and thresholds.
        Returns a processed numpy array ready for pytesseract.
        """
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not read image for preprocessing: {image_path}")

        # 1. Grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 2. Rescale if too small (OCR likes ~300 DPI text)
        height, width = gray.shape
        if height < 1000:
            gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

        # 3. Denoise
        denoised = cv2.fastNlMeansDenoising(gray, h=10)

        # 4. Adaptive Thresholding (good for documents with uneven lighting)
        # Tesseract 4+ LSTM actually prefers grayscale over binary thresholding
        # thresh = cv2.adaptiveThreshold(
        #     denoised, 255, 
        #     cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        #     cv2.THRESH_BINARY, 11, 2
        # )

        return denoised
