from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.core.security import verify_password, get_password_hash, create_access_token


class AuthService:

    @staticmethod
    def register(db: Session, payload: UserCreate) -> User:
        existing = db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered.")
        user = User(
            full_name=payload.full_name,
            email=payload.email.lower(),
            password=get_password_hash(payload.password),
            company_name=payload.company_name,
            company_size=payload.company_size,
            role=payload.role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def login(db: Session, payload: UserLogin) -> dict:
        user = db.query(User).filter(User.email == payload.email.lower()).first()
        if not user or not verify_password(payload.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid email or password.")
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Account deactivated.")
        token = create_access_token(data={"sub": str(user.id), "role": user.role})
        return {"access_token": token, "token_type": "bearer", "user": user}