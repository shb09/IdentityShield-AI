import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
DEMO_DATA_DIR = BASE_DIR / "demo_data"

UPLOAD_DIR.mkdir(exist_ok=True)
DEMO_DATA_DIR.mkdir(exist_ok=True)

SECRET_KEY = os.getenv("SECRET_KEY", "sih-2026-demo-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/tiff"}

# Risk engine weights (configurable)
RISK_WEIGHTS = {
    "document_validity": 0.20,
    "field_consistency": 0.20,
    "tampering": 0.30,
    "face_verification": 0.30,
}
