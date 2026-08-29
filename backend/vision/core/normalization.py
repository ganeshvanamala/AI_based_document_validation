import os
import hashlib
import shutil
from PIL import Image, ExifTags
from typing import Dict, Any, Tuple

class InputNormalizer:
    """
    Safely loads, hashes, and prepares inputs for analysis without modifying the original.
    """
    def __init__(self, workspace_dir: str = "temp_workspace"):
        self.workspace_dir = workspace_dir
        os.makedirs(self.workspace_dir, exist_ok=True)

    def _calculate_hash(self, file_path: str) -> str:
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    def normalize(self, file_path: str, document_id: str) -> Dict[str, Any]:
        """
        Creates an analysis copy, corrects orientation, and records basic info.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Cannot find {file_path}")

        file_hash = self._calculate_hash(file_path)
        ext = os.path.splitext(file_path)[1].lower()
        
        normalized_path = os.path.join(self.workspace_dir, f"{document_id}_normalized{ext}")
        
        info = {
            "document_id": document_id,
            "original_hash": file_hash,
            "extension": ext,
            "normalized_path": normalized_path
        }

        # If it's a PDF, just copy it safely. PDF processing handles the rest.
        if ext == '.pdf':
            shutil.copy2(file_path, normalized_path)
            info["type"] = "pdf"
            return info

        # If it's an image, normalize orientation
        try:
            img = Image.open(file_path)
            # Handle EXIF orientation
            try:
                for orientation in ExifTags.TAGS.keys():
                    if ExifTags.TAGS[orientation] == 'Orientation':
                        break
                exif = img._getexif()
                if exif is not None and orientation in exif:
                    if exif[orientation] == 3:
                        img = img.rotate(180, expand=True)
                    elif exif[orientation] == 6:
                        img = img.rotate(270, expand=True)
                    elif exif[orientation] == 8:
                        img = img.rotate(90, expand=True)
            except (AttributeError, KeyError, IndexError):
                pass # No EXIF orientation data
            
            # Save analysis copy in RGB (dropping alpha channel for consistent CV processing)
            img = img.convert('RGB')
            img.save(normalized_path, format='JPEG', quality=100)
            
            info["type"] = "image"
            info["dimensions"] = img.size
            
        except Exception as e:
            info["error"] = str(e)
            shutil.copy2(file_path, normalized_path) # Fallback to raw copy

        return info
