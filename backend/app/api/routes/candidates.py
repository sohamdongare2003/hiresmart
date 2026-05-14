from typing import List
from fastapi import APIRouter, Depends, File, UploadFile, Query, Path, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.job import Job
from app.schemas.candidate import BulkUploadResponse, CandidateResponse, ProcessingResultResponse, BulkProcessingResponse, ParsedCandidateResponse
from app.services.candidate_service import CandidateService
from app.services.processing_service import ResumeProcessingService
from fastapi import HTTPException

router = APIRouter(prefix="/api/candidates", tags=["Candidates"])


@router.post("/upload", response_model=BulkUploadResponse, status_code=207)
async def upload_resumes(job_id: int = Query(...), files: List[UploadFile] = File(...),
                         db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")
    if current_user.role == "hr" and job.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized.")
    return await CandidateService.bulk_upload(db, files, job_id)


@router.post("/{candidate_id}/process", response_model=ProcessingResultResponse)
def process_candidate(candidate_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ResumeProcessingService.process_candidate(db, candidate_id)


@router.post("/process/job/{job_id}", response_model=BulkProcessingResponse)
def process_all_for_job(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ResumeProcessingService.process_all_for_job(db, job_id)


@router.get("/{candidate_id}/parsed", response_model=ParsedCandidateResponse)
def get_parsed_candidate(candidate_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ResumeProcessingService.get_parsed_candidate(db, candidate_id)


@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(candidate_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return CandidateService.get_candidate_by_id(db, candidate_id)


@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return CandidateService.delete_candidate(db, candidate_id)