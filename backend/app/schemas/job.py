from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime


class JobCreate(BaseModel):
    title: str
    description: Optional[str] = None
    required_skills: List[str] | str
    experience: Optional[str] = None
    location: Optional[str] = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Job title cannot be empty")
        return v.strip()

    @field_validator("required_skills", mode="before")
    @classmethod
    def parse_skills(cls, v):
        if isinstance(v, str):
            skills = [s.strip() for s in v.split(",") if s.strip()]
        elif isinstance(v, list):
            skills = [s.strip() for s in v if s.strip()]
        else:
            raise ValueError("required_skills must be a list or comma-separated string")
        if not skills:
            raise ValueError("At least one skill is required")
        return skills


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    experience: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None


class CreatorInfo(BaseModel):
    id: int
    full_name: Optional[str]
    company_name: str

    class Config:
        from_attributes = True


class JobResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    required_skills: List[str]
    experience: Optional[str]
    location: Optional[str]
    status: str
    created_by: int
    creator: Optional[CreatorInfo]
    total_applications: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    total: int
    jobs: List[JobResponse]