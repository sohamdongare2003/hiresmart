import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class JobStatus(str, enum.Enum):
    active = "active"
    closed = "closed"
    draft  = "draft"


class Job(Base):
    __tablename__ = "jobs"

    id              = Column(Integer, primary_key=True, index=True)
    title           = Column(String(200), nullable=False)
    skills_required = Column(Text, nullable=False)
    experience      = Column(String(100), nullable=True)
    description     = Column(Text, nullable=True)
    location        = Column(String(100), nullable=True)
    status          = Column(Enum(JobStatus), nullable=False, default=JobStatus.active)
    created_by      = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at      = Column(DateTime, server_default=func.now())
    updated_at      = Column(DateTime, server_default=func.now(), onupdate=func.now())

    creator      = relationship("User", back_populates="jobs")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")