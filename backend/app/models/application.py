import enum
from sqlalchemy import Column, Integer, Float, Text, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class ApplicationStatus(str, enum.Enum):
    pending     = "pending"
    shortlisted = "shortlisted"
    rejected    = "rejected"


class Application(Base):
    __tablename__ = "applications"

    id             = Column(Integer, primary_key=True, index=True)
    job_id         = Column(Integer, ForeignKey("jobs.id"),       nullable=False, index=True)
    candidate_id   = Column(Integer, ForeignKey("candidates.id"), nullable=False, index=True)
    score          = Column(Float,   nullable=False, default=0.0)
    status         = Column(Enum(ApplicationStatus), nullable=False, default=ApplicationStatus.pending)
    matched_skills = Column(Text, nullable=True)
    missing_skills = Column(Text, nullable=True)
    match_summary  = Column(Text, nullable=True)
    rank           = Column(Integer, nullable=True)
    notes          = Column(Text, nullable=True)
    created_at     = Column(DateTime, server_default=func.now())
    updated_at     = Column(DateTime, server_default=func.now(), onupdate=func.now())

    job       = relationship("Job",       back_populates="applications")
    candidate = relationship("Candidate", back_populates="applications")