import os
from fastapi import HTTPException, status, UploadFile

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAGIC_BYTES = {
    b"%PDF":         "pdf",
    b"\xd0\xcf\x11\xe0": "doc",
    b"PK\x03\x04":   "docx",
}
MAX_FILE_SIZE_MB    = 5
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
MAX_FILES_PER_REQUEST = 20


def _get_extension(filename: str) -> str:
    return os.path.splitext(filename.lower())[1]


async def validate_resume_file(file: UploadFile) -> bytes:
    filename = file.filename or ""
    ext = _get_extension(filename)

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"'{filename}': Unsupported type '{ext}'. Allowed: PDF, DOC, DOCX.")

    content = await file.read()
    await file.seek(0)

    if len(content) == 0:
        raise HTTPException(status_code=400, detail=f"'{filename}': File is empty.")

    if len(content) > MAX_FILE_SIZE_BYTES:
        size_mb = len(content) / (1024 * 1024)
        raise HTTPException(status_code=413, detail=f"'{filename}': {size_mb:.1f} MB exceeds {MAX_FILE_SIZE_MB} MB limit.")

    detected = None
    for magic, ftype in MAGIC_BYTES.items():
        if content[:8].startswith(magic):
            detected = ftype
            break

    if detected is None:
        raise HTTPException(status_code=400, detail=f"'{filename}': File content does not match a valid format.")

    if ext == ".pdf"  and detected != "pdf":
        raise HTTPException(status_code=400, detail=f"'{filename}': Content does not match PDF format.")
    if ext == ".docx" and detected != "docx":
        raise HTTPException(status_code=400, detail=f"'{filename}': Content does not match DOCX format.")
    if ext == ".doc"  and detected != "doc":
        raise HTTPException(status_code=400, detail=f"'{filename}': Content does not match DOC format.")

    return content


def validate_file_count(files: list) -> None:
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")
    if len(files) > MAX_FILES_PER_REQUEST:
        raise HTTPException(status_code=400, detail=f"Max {MAX_FILES_PER_REQUEST} files per request.")