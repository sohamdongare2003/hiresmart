from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CandidateUploadResult(BaseModel):
    original_filename: str
    status: str
    error: Optional[str] = None
    candidate_id: Optional[int] = None
    file_path: Optional[str] = None
    file_size_kb: Optional[float] = None
    file_type: Optional[str] = None


class BulkUploadResponse(BaseModel):
    total_uploaded: int
    successful: int
    failed: int
    results: List[CandidateUploadResult]


class ProcessingResultResponse(BaseModel):
    candidate_id: int
    status: str
    error: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: Optional[List[str]] = []
    experience_years: Optional[str] = None
    summary: Optional[str] = None
    education: Optional[List[dict]] = []


class BulkProcessingResponse(BaseModel):
    job_id: int
    total: int
    successful: int
    failed: int
    results: List[ProcessingResultResponse]


class CandidateResponse(BaseModel):
    id: int
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    original_filename: str
    file_type: Optional[str]
    file_size: Optional[int]
    resume_path: str
    skills: Optional[List[str]]
    experience: Optional[str]
    summary: Optional[str]
    is_processed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ParsedCandidateResponse(BaseModel):
    candidate_id: int
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    resume_path: str
    file_type: Optional[str]
    skills: List[str]
    experience: Optional[str]
    education: List[dict]
    summary: Optional[str]
    is_processed: bool
    created_at: Optional[str]