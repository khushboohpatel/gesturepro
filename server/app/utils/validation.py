from fastapi import UploadFile
from typing import Optional

def validate_image_file(file: UploadFile) -> Optional[str]:
    """
    Validate uploaded image file
    
    Returns:
        Error message if validation fails, None if valid
    """
    # Check content type
    if not file.content_type or not file.content_type.startswith('image/'):
        return "File must be an image"
    
    # Check file size (10MB limit)
    if hasattr(file, 'size') and file.size:
        if file.size > 10 * 1024 * 1024:  # 10MB
            return "File size must be less than 10MB"
    
    # Check file extension
    if file.filename:
        allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}
        file_ext = '.' + file.filename.split('.')[-1].lower()
        if file_ext not in allowed_extensions:
            return f"File extension {file_ext} not allowed. Allowed: {', '.join(allowed_extensions)}"
    
    return None