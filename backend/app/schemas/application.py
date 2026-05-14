from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CandidateCard(BaseModel):
    application_id:   int
    candidate_id:     int
    rank:             Optional[int]
    status:           str
    full_name:        Optional[str]
    email:            Optional[str]
    phone:            Optional[str]
    skills:           List[str]
    matched_skills:   List[str]
    missing_skills:   List[str]
    match_score:      float
    match_summary:    Optional[str]
    experience_years: Optional[str]
    resume_link:      str
    file_type:        Optional[str]
    notes:            Optional[str]
    created_at:       datetime

    class Config:
        from_attributes = True


class CandidateListResponse(BaseModel):
    job_id:      int
    job_title:   str
    total:       int
    shortlisted: int
    rejected:    int
    pending:     int
    candidates:  List[CandidateCard]


class ShortlistRequest(BaseModel):
    notes: Optional[str] = None


class RejectRequest(BaseModel):
    notes: Optional[str] = None


class AddNotesRequest(BaseModel):
    notes: str


class ApplicationActionResponse(BaseModel):
    application_id: int
    candidate_id:   int
    full_name:      Optional[str]
    status:         str
    notes:          Optional[str]
    updated_at:     datetime

    class Config:
        from_attributes = True


class ApplicationResponse(BaseModel):
    id:             int
    job_id:         int
    candidate_id:   int
    score:          float
    match_summary:  Optional[str]
    matched_skills: Optional[List[str]]
    missing_skills: Optional[List[str]]
    status:         str
    rank:           Optional[int]
    notes:          Optional[str]
    created_at:     datetime

    class Config:
        from_attributes = True


class ApplicationStatusUpdate(BaseModel):
    status: str


class CandidateRankEntry(BaseModel):
    rank:               Optional[int]
    candidate_id:       int
    full_name:          Optional[str]
    email:              Optional[str]
    file_type:          Optional[str]
    experience_years:   Optional[str]
    summary:            Optional[str]
    skill_score:        float
    experience_score:   float
    final_score:        float
    matched_skills:     List[str]
    missing_skills:     List[str]
    application_status: str
    skipped:            bool
    skip_reason:        Optional[str]


class MatchingResultResponse(BaseModel):
    job_id:          int
    job_title:       str
    required_skills: List[str]
    total:           int
    ranked:          int
    skipped:         int
    candidates:      List[CandidateRankEntry]


class ScoreBreakdown(BaseModel):
    formula:     str
    skill_score: str
    exp_score:   str
    final_score: float


class SingleScoreResponse(BaseModel):
    job_id:           int
    job_title:        str
    candidate_id:     int
    full_name:        Optional[str]
    required_skills:  List[str]
    candidate_skills: List[str]
    matched_skills:   List[str]
    missing_skills:   List[str]
    skill_score:      float
    experience_score: float
    final_score:      float
    score_breakdown:  ScoreBreakdown