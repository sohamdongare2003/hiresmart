from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id           = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(200), nullable=False)
    email        = Column(String(150), unique=True, index=True, nullable=False)
    password     = Column(String(255), nullable=False)
    full_name    = Column(String(100), nullable=True)
    company_size = Column(String(50),  nullable=True)
    role         = Column(String(20),  nullable=False, default="hr")
    is_active    = Column(Boolean,     nullable=False, default=True)
    created_at   = Column(DateTime, server_default=func.now())
    updated_at   = Column(DateTime, server_default=func.now(), onupdate=func.now())

    jobs = relationship("Job", back_populates="creator")