import json
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.application import Application, ApplicationStatus
from app.models.job import Job
from app.models.candidate import Candidate
from app.schemas.application import CandidateCard, CandidateListResponse, ApplicationActionResponse


def _load_skills(raw):
    if not raw:
        return []
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return [str(s) for s in data if s]
    except Exception:
        pass
    return [s.strip() for s in raw.split(",") if s.strip()]


def _build_resume_link(file_path: str) -> str:
    normalized = file_path.replace("\\", "/")
    if normalized.startswith("uploads/"):
        normalized = normalized[len("uploads/"):]
    return f"/uploads/{normalized}"


def _get_app(db, application_id):
    app = db.query(Application).options(joinedload(Application.candidate)).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail=f"Application {application_id} not found.")
    return app


def _build_card(app: Application) -> CandidateCard:
    c = app.candidate
    return CandidateCard(
        application_id=app.id, candidate_id=c.id, rank=app.rank,
        status=app.status.value if hasattr(app.status, "value") else str(app.status),
        full_name=c.name, email=c.email, phone=c.phone,
        skills=_load_skills(c.skills), matched_skills=_load_skills(app.matched_skills),
        missing_skills=_load_skills(app.missing_skills), match_score=round(app.score or 0.0, 2),
        match_summary=app.match_summary or c.summary, experience_years=c.experience,
        resume_link=_build_resume_link(c.resume_path), file_type=c.file_type,
        notes=app.notes, created_at=app.created_at,
    )


def _build_action(app: Application) -> ApplicationActionResponse:
    return ApplicationActionResponse(
        application_id=app.id, candidate_id=app.candidate_id,
        full_name=app.candidate.name if app.candidate else None,
        status=app.status.value if hasattr(app.status, "value") else str(app.status),
        notes=app.notes, updated_at=app.updated_at,
    )


class ApplicationService:

    @staticmethod
    def list_candidates_for_job(db, job_id, status_filter=None, min_score=None, page=1, limit=10):
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")
        query = db.query(Application).options(joinedload(Application.candidate)).filter(Application.job_id == job_id)
        if status_filter:
            try:
                query = query.filter(Application.status == ApplicationStatus(status_filter))
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid status '{status_filter}'")
        if min_score is not None:
            query = query.filter(Application.score >= min_score)
        apps = query.order_by(
    Application.rank.is_(None).asc(),
    Application.rank.asc(),
    Application.score.desc()
).all()
        cards = [_build_card(a) for a in apps if a.candidate]
        total = len(cards)
        start = (page - 1) * limit
        paged = cards[start:start + limit]
        all_apps = db.query(Application).filter(Application.job_id == job_id).all()
        return CandidateListResponse(
            job_id=job_id, job_title=job.title, total=total,
            shortlisted=sum(1 for a in all_apps if a.status == ApplicationStatus.shortlisted),
            rejected=sum(1 for a in all_apps if a.status == ApplicationStatus.rejected),
            pending=sum(1 for a in all_apps if a.status == ApplicationStatus.pending),
            candidates=paged,
        )

    @staticmethod
    def shortlist(db, application_id, notes=None):
        app = _get_app(db, application_id)
        if app.status == ApplicationStatus.shortlisted:
            raise HTTPException(status_code=409, detail="Already shortlisted.")
        app.status = ApplicationStatus.shortlisted
        if notes:
            app.notes = notes.strip()
        db.commit(); db.refresh(app)
        return _build_action(app)

    @staticmethod
    def reject(db, application_id, notes=None):
        app = _get_app(db, application_id)
        if app.status == ApplicationStatus.rejected:
            raise HTTPException(status_code=409, detail="Already rejected.")
        app.status = ApplicationStatus.rejected
        if notes:
            app.notes = notes.strip()
        db.commit(); db.refresh(app)
        return _build_action(app)

    @staticmethod
    def reset_to_pending(db, application_id):
        app = _get_app(db, application_id)
        app.status = ApplicationStatus.pending
        db.commit(); db.refresh(app)
        return _build_action(app)

    @staticmethod
    def add_notes(db, application_id, notes):
        app = _get_app(db, application_id)
        if not notes or not notes.strip():
            raise HTTPException(status_code=400, detail="Notes cannot be empty.")
        app.notes = notes.strip()
        db.commit(); db.refresh(app)
        return _build_action(app)

    @staticmethod
    def get_application(db, application_id):
        return _build_card(_get_app(db, application_id))