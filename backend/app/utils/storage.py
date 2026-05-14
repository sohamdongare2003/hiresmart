import os
import uuid
import re
from pathlib import Path
from app.core.config import settings


def _safe_filename(filename: str) -> str:
    name, ext = os.path.splitext(filename)
    name = re.sub(r"[^\w\s-]", "", name).strip()
    name = re.sub(r"\s+", "_", name)
    return f"{name}{ext.lower()}"


def build_upload_dir(job_id: int) -> Path:
    upload_root = Path(settings.LOCAL_UPLOAD_DIR)
    job_dir = upload_root / f"job_{job_id}"
    job_dir.mkdir(parents=True, exist_ok=True)
    return job_dir


def save_file_locally(content: bytes, original_filename: str, job_id: int) -> dict:
    ext = os.path.splitext(original_filename.lower())[1]
    safe_name = _safe_filename(original_filename)
    unique_name = f"{uuid.uuid4().hex}_{safe_name}"
    job_dir = build_upload_dir(job_id)
    file_path = job_dir / unique_name
    file_path.write_bytes(content)
    return {
        "stored_filename": unique_name,
        "file_path": str(file_path),
        "file_size": len(content),
        "file_type": ext.lstrip("."),
    }


def delete_file_locally(file_path: str) -> bool:
    path = Path(file_path)
    if path.exists():
        path.unlink()
        return True
    return False