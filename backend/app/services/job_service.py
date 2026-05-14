import json
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.job import Job, JobStatus
from app.models.user import User
from app.schemas.job import JobCreate


def _skills_to_str(skills: List[str]) -> str:
    return ",".join(s.strip() for s in skills if s.strip())


def _str_to_skills(raw: str) -> List[str]:
    if not raw:
        return []
    return [s.strip() for s in raw.split(",") if s.strip()]


def _build_response(job: Job) -> dict:
    return {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "required_skills": _str_to_skills(job.skills_required),
        "experience": job.experience,
        "location": job.location,
        "status": job.status,
        "created_by": job.created_by,
        "creator": job.creator,
        "total_applications": len(job.applications) if job.applications else 0,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
    }


class JobService:

    @staticmethod
    def create_job(db: Session, payload: JobCreate, current_user: User) -> dict:
        job = Job(
            title=payload.title.strip(),
            description=payload.description,
            skills_required=_skills_to_str(payload.required_skills),
            experience=payload.experience,
            location=payload.location,
            status=JobStatus.active,
            created_by=current_user.id,
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        job = db.query(Job).options(joinedload(Job.creator), joinedload(Job.applications)).filter(Job.id == job.id).first()
        return _build_response(job)

    @staticmethod
    def get_all_jobs(db: Session, current_user: User, status_filter=None, search=None) -> dict:
        query = db.query(Job).options(joinedload(Job.creator), joinedload(Job.applications))
        if current_user.role == "hr":
            query = query.filter(Job.created_by == current_user.id)
        if status_filter:
            try:
                query = query.filter(Job.status == JobStatus(status_filter))
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid status '{status_filter}'")
        if search:
            query = query.filter(Job.title.ilike(f"%{search}%"))
        jobs = query.order_by(Job.created_at.desc()).all()
        return {"total": len(jobs), "jobs": [_build_response(j) for j in jobs]}

    @staticmethod
    def get_job_by_id(db: Session, job_id: int, current_user: User) -> dict:
        job = db.query(Job).options(joinedload(Job.creator), joinedload(Job.applications)).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")
        if current_user.role == "hr" and job.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized.")
        return _build_response(job)

    @staticmethod
    def delete_job(db: Session, job_id: int, current_user: User) -> dict:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")
        if current_user.role != "admin" and job.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized.")
        db.delete(job)
        db.commit()
        return {"message": f"Job '{job.title}' deleted.", "deleted_id": job_id}