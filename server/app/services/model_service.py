import os
import json
import io
import logging
import time
from PIL import Image
from typing import Union, Dict
from ultralytics import YOLO
from collections import deque
from datetime import datetime

logger = logging.getLogger(__name__)

class SentenceBuilder:
    """Handles building sentences from continuous predictions"""
    
    def __init__(self, stability_threshold: int = 3, min_confidence: float = 0.5):
        self.predictions_buffer = deque(maxlen=10)
        self.current_sentence = []
        self.last_stable_prediction = None
        self.stability_count = 0
        self.stability_threshold = stability_threshold
        self.min_confidence = min_confidence
        self.last_prediction_time = None
        self.word_timeout = 3.0
        self.session_start_time = datetime.now()
        
    def add_prediction(self, prediction: Dict) -> Dict:
        """Add a new prediction and update sentence if stable"""
        current_time = datetime.now()
        
        # Extract the best prediction
        if prediction["detections"] and len(prediction["detections"]) > 0:
            best_detection = prediction["detections"][0]
            predicted_class = best_detection["class"]
            confidence = best_detection["confidence"]
        else:
            predicted_class = "no_detection"
            confidence = 0.0
        
        # Only consider predictions above minimum confidence
        if confidence < self.min_confidence:
            predicted_class = "no_detection"
        
        # Add to buffer
        self.predictions_buffer.append({
            "class": predicted_class,
            "confidence": confidence,
            "timestamp": current_time
        })
        
        # Check for stability
        recent_predictions = list(self.predictions_buffer)[-self.stability_threshold:]
        
        if len(recent_predictions) >= self.stability_threshold:
            # Check if all recent predictions are the same
            classes = [p["class"] for p in recent_predictions]
            
            if all(c == classes[0] for c in classes) and classes[0] != "no_detection":
                stable_class = classes[0]
                
                # Check if this is a new stable prediction
                if stable_class != self.last_stable_prediction:
                    # Check timeout to avoid rapid repetitions
                    if (self.last_prediction_time is None or 
                        (current_time - self.last_prediction_time).total_seconds() > 1.0):
                        
                        self.current_sentence.append(stable_class)
                        self.last_stable_prediction = stable_class
                        self.last_prediction_time = current_time
                        
                        logger.info(f"Added word to sentence: {stable_class}")
        
        # Build current sentence text
        sentence_text = " ".join(self.current_sentence)
        
        return {
            "current_word": self.last_stable_prediction or "",
            "sentence": sentence_text,
            "word_count": len(self.current_sentence),
            "buffer_size": len(self.predictions_buffer),
            "last_prediction": predicted_class,
            "last_confidence": confidence
        }
    
    def clear_sentence(self):
        """Clear the current sentence"""
        self.current_sentence = []
        self.last_stable_prediction = None
        self.last_prediction_time = None
        self.predictions_buffer.clear()
        logger.info("Sentence cleared")
    
    def get_sentence_info(self) -> Dict:
        """Get current sentence information"""
        return {
            "sentence": " ".join(self.current_sentence),
            "word_count": len(self.current_sentence),
            "words": self.current_sentence.copy(),
            "last_word": self.last_stable_prediction,
            "last_prediction_time": self.last_prediction_time.isoformat() if self.last_prediction_time else None,
            "session_duration": (datetime.now() - self.session_start_time).total_seconds()
        }

class ModelService:
    """Service for handling YOLO model operations with sentence building"""
    
    def __init__(self):
        self.model = None
        self.class_names = []
        self.img_size = 640
        self.is_loaded = False
        self.model_path = None
        self.load_time = None
        self.sentence_builders = {}
    
    def load_model(self, model_path: str = None, class_names_path: str = None) -> bool:
        """Load the PyTorch YOLO model and class names"""
        try:
            start_time = time.time()
            
            if model_path is None:
                model_path = os.environ.get('YOLO_MODEL_PATH')
                if not model_path:
                    model_path = os.path.abspath(os.path.join(
                        os.path.dirname(__file__), 
                        "..", "..", "ml", "saved_models", "yolo", "yolo_best.pt"
                    ))
        
            if class_names_path is None:
                class_names_path = os.environ.get('CLASS_NAMES_PATH')
                if not class_names_path:
                    class_names_path = os.path.abspath(os.path.join(
                        os.path.dirname(__file__), 
                        "..", "..", "ml", "saved_models", "yolo", "class_names.json"
                    ))
            
            if not os.path.exists(model_path):
                logger.error(f"Model file not found: {model_path}")
                return False
                
            if not os.path.exists(class_names_path):
                logger.error(f"Class names file not found: {class_names_path}")
                return False
            
            # Load YOLO model
            logger.info(f"Loading YOLO model from {model_path}")
            self.model = YOLO(model_path)
            
            # Load class names
            with open(class_names_path, 'r') as f:
                self.class_names = json.load(f)
            
            self.model_path = model_path
            self.load_time = time.time() - start_time
            self.is_loaded = True
            
            logger.info(f"✅ YOLO model loaded successfully in {self.load_time:.2f}s")
            logger.info(f"📊 Classes: {len(self.class_names)}")
            logger.info(f"🎯 Model task: {self.model.task}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error loading model: {str(e)}")
            self.is_loaded = False
            return False
    
    def get_or_create_sentence_builder(self, session_id: str) -> SentenceBuilder:
        """Get or create a sentence builder for a session"""
        if session_id not in self.sentence_builders:
            self.sentence_builders[session_id] = SentenceBuilder()
        return self.sentence_builders[session_id]
    
    def predict_stream(self, image_data: Union[bytes, Image.Image], 
                          session_id: str, conf_threshold: float = 0.25) -> Dict:
        """Make prediction and update sentence for continuous capture"""
        if not self.is_loaded:
            raise RuntimeError("Model not loaded")
        
        try:
            # Make regular prediction
            prediction = self.predict(image_data, conf_threshold)
            
            # Get sentence builder for this session
            sentence_builder = self.get_or_create_sentence_builder(session_id)
            
            # Update sentence
            sentence_info = sentence_builder.add_prediction(prediction)
            
            # Combine prediction with sentence info
            result = {
                **prediction,
                "sentence_info": sentence_info,
                "session_id": session_id
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error during continuous prediction: {str(e)}")
            raise
    
    def clear_session_sentence(self, session_id: str) -> Dict:
        """Clear sentence for a specific session"""
        if session_id in self.sentence_builders:
            self.sentence_builders[session_id].clear_sentence()
            return {"success": True, "message": f"Sentence cleared for session {session_id}"}
        return {"success": False, "message": f"Session {session_id} not found"}
    
    def get_session_sentence(self, session_id: str) -> Dict:
        """Get current sentence for a session"""
        if session_id in self.sentence_builders:
            return self.sentence_builders[session_id].get_sentence_info()
        return {"sentence": "", "word_count": 0, "words": []}
    
    def preprocess_image(self, image_data: Union[bytes, Image.Image]) -> Image.Image:
        """Preprocess image for YOLO inference"""
        try:
            # Handle different input types
            if isinstance(image_data, bytes):
                image = Image.open(io.BytesIO(image_data))
            elif isinstance(image_data, Image.Image):
                image = image_data
            else:
                raise ValueError("Invalid image data type")
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            return image
            
        except Exception as e:
            logger.error(f"Error preprocessing image: {str(e)}")
            raise
    
    def predict(self, image_data: Union[bytes, Image.Image], conf_threshold: float = 0.25) -> Dict:
        """Make prediction on image using YOLO"""
        if not self.is_loaded:
            raise RuntimeError("Model not loaded")
        
        try:
            start_time = time.time()
            
            # Preprocess image
            image = self.preprocess_image(image_data)
            
            # Make prediction with YOLO
            results = self.model.predict(
                source=image,
                conf=conf_threshold,
                verbose=False,
                imgsz=self.img_size
            )
            
            # Extract results
            result = results[0]  # First (and only) result
            
            predictions = []
            if result.boxes is not None and len(result.boxes) > 0:
                for box in result.boxes:
                    # Extract box data
                    xyxy = box.xyxy[0].cpu().numpy()  # Bounding box coordinates
                    conf = float(box.conf[0].cpu().numpy())  # Confidence
                    cls_idx = int(box.cls[0].cpu().numpy())  # Class index
                    
                    # Get class name
                    class_name = (
                        self.class_names[cls_idx] 
                        if cls_idx < len(self.class_names) 
                        else f"class_{cls_idx}"
                    )
                    
                    predictions.append({
                        "class": class_name,
                        "confidence": conf,
                        "bbox": {
                            "x1": int(xyxy[0]),
                            "y1": int(xyxy[1]), 
                            "x2": int(xyxy[2]),
                            "y2": int(xyxy[3]),
                            "width": int(xyxy[2] - xyxy[0]),
                            "height": int(xyxy[3] - xyxy[1])
                        }
                    })
            
            # Sort predictions by confidence
            predictions.sort(key=lambda x: x["confidence"], reverse=True)
            
            inference_time = time.time() - start_time
            
            # Prepare response
            response = {
                "detections": predictions,
                "num_detections": len(predictions),
                "inference_time": round(inference_time, 4),
                "image_size": {
                    "width": image.size[0],
                    "height": image.size[1]
                }
            }
            
            # Add top prediction for backwards compatibility
            if predictions:
                response["predicted_class"] = predictions[0]["class"]
                response["confidence"] = predictions[0]["confidence"]
                response["bbox"] = predictions[0]["bbox"]
            else:
                response["predicted_class"] = "no_detection"
                response["confidence"] = 0.0
                response["bbox"] = None
            
            return response
            
        except Exception as e:
            logger.error(f"Error during prediction: {str(e)}")
            raise
    
    def get_model_info(self) -> Dict:
        """Get model information"""
        return {
            "is_loaded": self.is_loaded,
            "model_path": self.model_path,
            "model_type": "YOLOv8 PyTorch",
            "num_classes": len(self.class_names),
            "class_names": self.class_names,
            "image_size": self.img_size,
            "load_time": self.load_time,
            "task": self.model.task if self.model else None,
            "active_sessions": len(self.sentence_builders)
        }

# Global model service instance
model_service = ModelService()