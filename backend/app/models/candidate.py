from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id                = Column(Integer, primary_key=True, index=True)
    name              = Column(String(150), nullable=True)
    email             = Column(String(150), nullable=True, index=True)
    phone             = Column(String(20),  nullable=True)
    skills            = Column(Text, nullable=True)
    experience        = Column(String(50),  nullable=True)
    resume_path       = Column(String(500), nullable=False)
    summary           = Column(Text, nullable=True)
    education         = Column(Text, nullable=True)
    original_filename = Column(String(300), nullable=False)
    stored_filename   = Column(String(300), nullable=False)
    file_size         = Column(Integer, nullable=True)
    file_type         = Column(String(10),  nullable=True)
    resume_text       = Column(Text, nullable=True)
    is_processed      = Column(Boolean, nullable=False, default=False)
    processing_error  = Column(Text, nullable=True)
    created_at        = Column(DateTime, server_default=func.now())
    updated_at        = Column(DateTime, server_default=func.now(), onupdate=func.now())

    applications = relationship("Application", back_populates="candidate", cascade="all, delete-orphan")