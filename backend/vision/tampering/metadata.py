from PIL import Image, ExifTags
from typing import Optional
from .schemas import TamperingSignal

class MetadataAnalyzer:
    """Phase 4 - Metadata Forensics"""
    
    def analyze(self, image_path: str) -> Optional[TamperingSignal]:
        try:
            img = Image.open(image_path)
            exif_data = img._getexif()
            if not exif_data:
                return None

            suspicious_software = ["photoshop", "gimp", "canva", "illustrator", "paint"]
            
            for tag_id, value in exif_data.items():
                tag_name = ExifTags.TAGS.get(tag_id, tag_id)
                if tag_name == "Software" and isinstance(value, str):
                    if any(sus in value.lower() for sus in suspicious_software):
                        return TamperingSignal(
                            type="metadata_anomaly",
                            severity="MEDIUM",  # Metadata alone is not HIGH proof
                            confidence=0.90,
                            reason=f"Editing software metadata detected: {value}"
                        )
        except Exception:
            pass
        return None
