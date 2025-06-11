import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import auth
from .api.sign_detector import router as sign_detector_router
from .models.user import Base
from .utils.db import engine
from .services.model_service import model_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GesturePro API",
    description="Sign Language Detection and Translation API using YOLOv8",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(sign_detector_router, prefix="/api/sign", tags=["sign_detection"])

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("🚀 Starting GesturePro API...")
    
    model_path = os.environ.get('YOLO_MODEL_PATH')
    class_names_path = os.environ.get('CLASS_NAMES_PATH')
    
    if not model_path:
        model_path = os.path.join("ml", "saved_models", "yolo", "yolo_best.pt")
    
    if not class_names_path:
        class_names_path = os.path.join("ml", "saved_models", "yolo", "class_names.json")
    
    logger.info(f"Current working directory: {os.getcwd()}")
    logger.info(f"Looking for model at: {model_path}")
    logger.info(f"Looking for class names at: {class_names_path}")
    logger.info(f"Model file exists: {os.path.exists(model_path)}")
    logger.info(f"Class names file exists: {os.path.exists(class_names_path)}")
    
    if os.path.exists(model_path) and os.path.exists(class_names_path):
        logger.info("📦 Loading model...")
        success = model_service.load_model(model_path, class_names_path)
        if success:
            logger.info("✅ Model loaded successfully!")
        else:
            logger.error("❌ Failed to load model")
    else:
        logger.warning(f"⚠️  Model files not found.")
        logger.warning(f"   Expected model: {model_path}")
        logger.warning(f"   Expected classes: {class_names_path}")
        logger.warning("   Make sure ML models are properly mounted in Docker")

@app.get("/")
async def root():
    return {
        "message": "GesturePro API - Sign Language Detection",
        "status": "running",
        "version": "1.0.0",
        "model_loaded": model_service.is_loaded,
        "model_type": "YOLOv8 PyTorch"
    }

@app.get("/health")
async def health_check():
    model_info = model_service.get_model_info() if model_service.is_loaded else {}
    
    return {
        "status": "healthy",
        "model_loaded": model_service.is_loaded,
        "database": "connected",
        "model_info": model_info
    }