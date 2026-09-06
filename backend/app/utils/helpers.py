import uuid
import os
import hashlib
from datetime import datetime
from pathlib import Path
from app.config import UPLOAD_DIR


def generate_screening_id() -> str:
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    short_uuid = uuid.uuid4().hex[:8].upper()
    return f"SCR-{timestamp}-{short_uuid}"


def save_upload(file_content: bytes, filename: str, subfolder: str = "") -> str:
    target_dir = UPLOAD_DIR / subfolder if subfolder else UPLOAD_DIR
    target_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(filename).suffix.lower()
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = target_dir / unique_name

    with open(file_path, "wb") as f:
        f.write(file_content)

    return str(file_path)


def get_file_hash(file_path: str) -> str:
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def format_datetime(dt_str: str) -> str:
    try:
        dt = datetime.fromisoformat(dt_str)
        return dt.strftime("%d %b %Y, %H:%M")
    except (ValueError, TypeError):
        return dt_str


def cleanup_old_files(max_age_hours: int = 24):
    now = datetime.now().timestamp()
    for file_path in UPLOAD_DIR.rglob("*"):
        if file_path.is_file():
            age_hours = (now - file_path.stat().st_mtime) / 3600
            if age_hours > max_age_hours:
                file_path.unlink(missing_ok=True)
