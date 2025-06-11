import io
import logging
import uuid
import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Header
from fastapi.responses import JSONResponse
from typing import Optional, List
from PIL import Image
from ..services.model_service import model_service
from ..utils.validation import validate_image_file

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/predict-stream")
async def predict_stream(
    file: UploadFile = File(...),
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    confidence_threshold: Optional[float] = Query(0.25, ge=0.0, le=1.0)
):
    """
    Stream prediction for building sentences from sign language video
    
    Args:
        file: Image frame from video stream
        session_id: Session identifier for sentence building
        confidence_threshold: Minimum confidence for detections
    
    Returns:
        Detection results with updated sentence
    """
    if not model_service.is_loaded:
        raise HTTPException(
            status_code=503, 
            detail="Model not available. Please ensure the model is loaded."
        )
    
    if not session_id:
        session_id = str(uuid.uuid4())
    
    validation_error = validate_image_file(file)
    if validation_error:
        raise HTTPException(status_code=400, detail=validation_error)
    
    try:
        image_data = await file.read()
        result = model_service.predict_stream(
            image_data, 
            session_id, 
            confidence_threshold
        )
        
        logger.debug(f"Stream prediction for session {session_id}: {result['sentence_info']['sentence']}")
        
        return JSONResponse(content={
            "success": True,
            "data": result,
            "metadata": {
                "filename": file.filename,
                "session_id": session_id,
                "confidence_threshold": confidence_threshold
            }
        })
        
    except Exception as e:
        logger.error(f"Stream prediction error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Prediction failed: {str(e)}"
        )
    
@router.post("/predict-base64-stream")
async def predict_base64_stream(
    request_data: dict,
    session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    confidence_threshold: Optional[float] = Query(0.25, ge=0.0, le=1.0)
):
    """
    Stream prediction from base64 encoded image for sentence building
    Expected format: {"image": "base64_string"}
    """
    if not model_service.is_loaded:
        raise HTTPException(status_code=503, detail="Model not available")
    
    if not session_id:
        session_id = str(uuid.uuid4())
    
    try:
        import base64
        
        image_base64 = request_data.get("image", "")
        if not image_base64:
            raise HTTPException(status_code=400, detail="No image data provided")
        
        if "data:image" in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        image_bytes = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_bytes))
        
        result = model_service.predict_stream(
            image, 
            session_id, 
            confidence_threshold
        )
        
        return JSONResponse(content={
            "success": True,
            "data": result,
            "metadata": {
                "session_id": session_id,
                "confidence_threshold": confidence_threshold
            }
        })
        
    except Exception as e:
        logger.error(f"Base64 continuous prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/sentence/{session_id}")
async def get_current_sentence(session_id: str):
    """Get current sentence for a session"""
    try:
        sentence_info = model_service.get_session_sentence(session_id)
        return JSONResponse(content={
            "success": True,
            "data": sentence_info,
            "session_id": session_id
        })
    except Exception as e:
        logger.error(f"Error getting sentence for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/sentence/{session_id}")
async def clear_sentence(session_id: str):
    """Clear sentence for a session"""
    try:
        result = model_service.clear_session_sentence(session_id)
        return JSONResponse(content={
            "success": result["success"],
            "message": result["message"],
            "session_id": session_id
        })
    except Exception as e:
        logger.error(f"Error clearing sentence for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict")
async def predict_sign_language(
    file: UploadFile = File(...),
    confidence_threshold: Optional[float] = Query(0.25, ge=0.0, le=1.0, description="Minimum confidence threshold")
):
    """
    Predict sign language from uploaded image using model
    
    Args:
        file: Image file to analyze
        confidence_threshold: Minimum confidence for detections (0.0-1.0)
    
    Returns:
        Detection results with classes, confidences, and bounding boxes
    """
    if not model_service.is_loaded:
        raise HTTPException(
            status_code=503, 
            detail="Model not available. Please ensure the model is loaded."
        )
    
    validation_error = validate_image_file(file)
    if validation_error:
        raise HTTPException(status_code=400, detail=validation_error)
    
    try:
        image_data = await file.read()
        result = model_service.predict(image_data, confidence_threshold)
        
        logger.info(f"Prediction made for {file.filename}: {result['num_detections']} detections")
        
        return JSONResponse(content={
            "success": True,
            "data": result,
            "metadata": {
                "filename": file.filename,
                "file_size": file.size,
                "confidence_threshold": confidence_threshold
            }
        })
        
    except Exception as e:
        logger.error(f"Prediction error for {file.filename}: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Prediction failed: {str(e)}"
        )

@router.post("/predict-batch")
async def predict_batch(
    files: List[UploadFile] = File(...),
    confidence_threshold: Optional[float] = Query(0.25, ge=0.0, le=1.0)
):
    """
    Predict sign language for multiple images
    """
    if not model_service.is_loaded:
        raise HTTPException(status_code=503, detail="Model not available")
    
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files per batch")
    
    results = []
    for i, file in enumerate(files):
        try:
            validation_error = validate_image_file(file)
            if validation_error:
                results.append({
                    "filename": file.filename,
                    "success": False,
                    "error": validation_error,
                    "index": i
                })
                continue
            
            image_data = await file.read()
            result = model_service.predict(image_data, confidence_threshold)
            results.append({
                "filename": file.filename,
                "success": True,
                "data": result,
                "index": i
            })
            
        except Exception as e:
            results.append({
                "filename": file.filename,
                "success": False,
                "error": str(e),
                "index": i
            })
    
    successful_predictions = sum(1 for r in results if r["success"])
    
    return JSONResponse(content={
        "results": results,
        "summary": {
            "total_files": len(files),
            "successful_predictions": successful_predictions,
            "failed_predictions": len(files) - successful_predictions
        }
    })

@router.post("/predict-base64")
async def predict_from_base64(
    image_data: dict,
    confidence_threshold: Optional[float] = Query(0.25, ge=0.0, le=1.0)
):
    """
    Predict sign language from base64 encoded image
    Expected format: {"image": "base64_string"}
    """
    if not model_service.is_loaded:
        raise HTTPException(status_code=503, detail="Model not available")
    
    try:
        import base64
        
        image_base64 = image_data.get("image", "")
        if not image_base64:
            raise HTTPException(status_code=400, detail="No image data provided")
        
        if "data:image" in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        image_bytes = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_bytes))
        
        result = model_service.predict(image, confidence_threshold)
        
        return JSONResponse(content={
            "success": True,
            "data": result
        })
        
    except Exception as e:
        logger.error(f"Base64 prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/model/info")
async def get_model_info():
    """Get YOLO model information and status"""
    return JSONResponse(content=model_service.get_model_info())

@router.get("/model/classes")
async def get_model_classes():
    """Get available sign language classes"""
    if not model_service.is_loaded:
        raise HTTPException(status_code=503, detail="Model not available")
    
    return JSONResponse(content={
        "classes": model_service.class_names,
        "num_classes": len(model_service.class_names)
    })

@router.post("/model/reload")
async def reload_model():
    """Reload the YOLO model (admin endpoint)"""
    try:
        model_path = os.path.join("app", "models", "saved_models", "sign_language_yolo.pt")
        class_names_path = os.path.join("app", "models", "saved_models", "class_names.json")
        
        success = model_service.load_model(model_path, class_names_path)
        
        if success:
            return JSONResponse(content={
                "success": True, 
                "message": "YOLO model reloaded successfully",
                "model_info": model_service.get_model_info()
            })
        else:
            raise HTTPException(status_code=500, detail="Failed to reload model")
            
    except Exception as e:
        logger.error(f"Model reload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Reload failed: {str(e)}")