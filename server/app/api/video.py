from fastapi import APIRouter, File, UploadFile
from ..services.video_service import VideoService

router = APIRouter()
video_service = VideoService()

@router.post("/predict_frame")
async def predict_frame(frame: UploadFile = File(...)):
    """
    Process a single video frame and return the predicted character.
    """
    content = await frame.read()
    result = video_service.predict_frame(content)
    return result

@router.get("/reset_capture")
def reset_capture():
    """
    Reset the capture state, clearing all text and last character.
    """
    result = video_service.reset_capture()
    return result

@router.get("/clear_text")
def clear_text():
    """
    Clear the current predicted text.
    """
    result = video_service.clear_text()
    return result 