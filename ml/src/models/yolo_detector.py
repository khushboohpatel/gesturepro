import os
import json
from ultralytics import YOLO
from typing import List, Dict, Any, Optional

class YOLOSignDetector:
    """YOLO-based sign language detector"""
    
    def __init__(self, model_path: Optional[str] = None):
        self.model = None
        self.class_names = []
        self.model_path = model_path
        
    def load_model(self, model_path: str, class_names_path: str):
        """Load trained YOLO model and class names"""
        self.model = YOLO(model_path)
        
        with open(class_names_path, 'r') as f:
            self.class_names = json.load(f)
        
        self.model_path = model_path
        print(f"Model loaded with {len(self.class_names)} classes")
    
    def train(self, data_yaml_path: str, epochs: int = 50, img_size: int = 640, **kwargs):
        """Train YOLO model"""
        # Initialize with pretrained weights
        self.model = YOLO('yolov8n.pt')
        
        # Set default training parameters
        train_params = {
            'data': data_yaml_path,
            'epochs': epochs,
            'imgsz': img_size,
            'save': True,
            'save_period': 10,
            'patience': 20,
            'batch': 16,
            'workers': 4,
            'device': 'mps',  # Change to 'cuda' for GPU
        }
        
        # Update with any additional parameters
        train_params.update(kwargs)
        
        # Train the model
        results = self.model.train(**train_params)
        
        return results
    
    def predict(self, image_path: str, confidence_threshold: float = 0.5) -> List[Dict[str, Any]]:
        """Predict signs in image"""
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        results = self.model(image_path)
        detections = []
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                    conf = box.conf[0].cpu().numpy()
                    cls = int(box.cls[0].cpu().numpy())
                    
                    if conf > confidence_threshold:
                        detections.append({
                            'class': self.class_names[cls],
                            'confidence': float(conf),
                            'bbox': [int(x1), int(y1), int(x2), int(y2)]
                        })
        
        return detections
    
    def evaluate(self, val_data_path: str) -> Dict[str, float]:
        """Evaluate model on validation data"""
        if self.model is None:
            raise ValueError("Model not loaded.")
        
        metrics = self.model.val(data=val_data_path)
        
        return {
            'mAP50': float(metrics.box.map50),
            'mAP50-95': float(metrics.box.map),
            'precision': float(metrics.box.mp),
            'recall': float(metrics.box.mr)
        }
    
    def save_model(self, save_dir: str):
        """Save model and class names"""
        if self.model is None:
            raise ValueError("No model to save.")
        
        os.makedirs(save_dir, exist_ok=True)
        
        # Save class names
        class_names_path = os.path.join(save_dir, 'class_names.json')
        with open(class_names_path, 'w') as f:
            json.dump(self.class_names, f)
        
        print(f"Model artifacts saved to: {save_dir}")