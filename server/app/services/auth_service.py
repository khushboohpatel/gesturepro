import logging
import re
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from uuid import uuid4
from ..models.user import User
from ..models.schemas import UserCreate, UserLogin
from ..utils.db import SessionLocal

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

logger = logging.getLogger(__name__)

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def validate_password(password: str):
    errors = []
    if len(password) < 8:
        errors.append("at least 8 characters long")
    if not re.search(r"[A-Z]", password):
        errors.append("one uppercase letter")
    if not re.search(r"[a-z]", password):
        errors.append("one lowercase letter")
    if not re.search(r"\d", password):
        errors.append("one digit")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        errors.append("one special character")
    if errors:
        raise ValueError("Password must contain " + ", ".join(errors) + ".")

def create_user(db: Session, user: UserCreate):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        logger.warning(f"Attempt to register with existing email: {user.email}")
        raise ValueError("Email already registered")
    validate_password(user.password)
    verification_token = str(uuid4())
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        hashed_password=hashed_password,
        verification_token=verification_token
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    logger.info(f"User registered: {user.email}")
    # Mock sending email
    logger.info(f"Verification email sent to {user.email} with token {verification_token}")
    return new_user

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        logger.warning(f"Login failed for {email}: user not found")
        return None
    if not verify_password(password, user.hashed_password):
        logger.warning(f"Login failed for {email}: incorrect password")
        return None
    if not user.is_verified:
        logger.warning(f"Login failed for {email}: email not verified")
        return None
    return user

def generate_jwt(user: User):
    payload = {"sub": user.email}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def verify_email(db: Session, token: str):
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        logger.error(f"Invalid verification token: {token}")
        raise ValueError("Invalid verification token")
    user.is_verified = True
    user.verification_token = None
    db.commit()
    logger.info(f"Email verified for {user.email}")
    return user

def verify_jwt(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise ValueError("Invalid token")
        return email
    except JWTError:
        raise ValueError("Invalid token")

def get_user_by_email(db: Session, email: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise ValueError("User not found")
    return user