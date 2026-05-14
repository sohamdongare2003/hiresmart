from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.job import JobCreate, JobResponse, JobListResponse
from app.services.job_service import JobService

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


@router.post("", response_model=JobResponse, status_code=201)
def create_job(payload: JobCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return JobService.create_job(db, payload, current_user)


@router.get("", response_model=JobListResponse)
def get_all_jobs(status: Optional[str] = Query(None), search: Optional[str] = Query(None),
                 db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return JobService.get_all_jobs(db, current_user, status, search)


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return JobService.get_job_by_id(db, job_id, current_user)


@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return JobService.delete_job(db, job_id, current_user)