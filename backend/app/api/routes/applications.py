import csv
import io
import json
from typing import Optional
from fastapi import APIRouter, Depends, Path, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.application import Application, ApplicationStatus
from app.schemas.application import (
    CandidateListResponse,
    CandidateCard,
    ApplicationActionResponse,
    ShortlistRequest,
    RejectRequest,
    AddNotesRequest,
)
from app.services.application_service import ApplicationService

router = APIRouter(tags=["Applications"])


@router.get("/api/jobs/{job_id}/candidates", response_model=CandidateListResponse)
def list_candidates(
    job_id: int,
    status: Optional[str] = Query(None),
    min_score: Optional[float] = Query(None, ge=0, le=100),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ApplicationService.list_candidates_for_job(db, job_id, status, min_score, page, limit)


@router.post("/api/applications/{application_id}/shortlist", response_model=ApplicationActionResponse)
def shortlist(
    application_id: int,
    payload: ShortlistRequest = ShortlistRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ApplicationService.shortlist(db, application_id, payload.notes)


@router.post("/api/applications/{application_id}/reject", response_model=ApplicationActionResponse)
def reject(
    application_id: int,
    payload: RejectRequest = RejectRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ApplicationService.reject(db, application_id, payload.notes)


@router.post("/api/applications/{application_id}/reset", response_model=ApplicationActionResponse)
def reset(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ApplicationService.reset_to_pending(db, application_id)


@router.post("/api/applications/{application_id}/notes", response_model=ApplicationActionResponse)
def add_notes(
    application_id: int,
    payload: AddNotesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ApplicationService.add_notes(db, application_id, payload.notes)


@router.get("/api/applications/{application_id}", response_model=CandidateCard)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ApplicationService.get_application(db, application_id)


@router.get("/api/jobs/{job_id}/export/csv")
def export_shortlisted_csv(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    apps = db.query(Application).filter(
        Application.job_id == job_id,
        Application.status == ApplicationStatus.shortlisted,
    ).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Rank", "Name", "Email", "Phone",
        "Experience", "Match Score", "Matched Skills",
        "Missing Skills", "Notes",
    ])

    for app in sorted(apps, key=lambda a: a.rank or 999):
        c = app.candidate
        matched = ", ".join(json.loads(app.matched_skills) if app.matched_skills else [])
        missing = ", ".join(json.loads(app.missing_skills) if app.missing_skills else [])
        writer.writerow([
            app.rank,
            c.name or "",
            c.email or "",
            c.phone or "",
            c.experience or "",
            round(app.score, 1),
            matched,
            missing,
            app.notes or "",
        ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=shortlisted_job_{job_id}.csv"},
    )