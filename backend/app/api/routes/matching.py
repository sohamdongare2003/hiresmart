from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.application import MatchingResultResponse, SingleScoreResponse
from app.services.matching_service import MatchingService

router = APIRouter(prefix="/api/matching", tags=["Matching"])


@router.post("/job/{job_id}", response_model=MatchingResultResponse)
def match_candidates(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return MatchingService.match_candidates_for_job(db, job_id)


@router.get("/score/job/{job_id}/candidate/{candidate_id}", response_model=SingleScoreResponse)
def preview_score(job_id: int, candidate_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return MatchingService.score_single(db, job_id, candidate_id)