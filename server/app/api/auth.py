from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..models.schemas import UserCreate, UserLogin, UserOut
from ..services.auth_service import create_user, authenticate_user, generate_jwt, verify_email
from ..utils.db import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        new_user = create_user(db, user)
        return new_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = authenticate_user(db, user.email, user.password)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials or email not verified")
    token = generate_jwt(db_user)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/verify-email")
def verify(token: str, db: Session = Depends(get_db)):
    try:
        user = verify_email(db, token)
        return {"message": "Email verified successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))