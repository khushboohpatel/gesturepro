import matplotlib.pyplot as plt
import cv2
import numpy as np
from typing import List, Dict, Any

def plot_training_results(results_dir: str):
    """Plot training results from YOLO training"""
    import os
    
    results_path = os.path.join(results_dir, 'results.png')
    if os.path.exists(results_path):
        img = plt.imread(results_path)
        plt.figure(figsize=(15, 10))
        plt.imshow(img)
        plt.axis('off')
        plt.title('Training Results')
        plt.show()
    else:
        print(f"Results plot not found at {results_path}")

def visualize_predictions(image_path: str, detections: List[Dict[str, Any]], 
                         confidence_threshold: float = 0.5):
    """Visualize predictions on image"""
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    for detection in detections:
        if detection['confidence'] > confidence_threshold:
            x1, y1, x2, y2 = detection['bbox']
            
            # Draw bounding box
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            # Add label
            label = f"{detection['class']}: {detection['confidence']:.2f}"
            cv2.putText(img, label, (x1, y1-10), 
                      cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    
    plt.figure(figsize=(10, 8))
    plt.imshow(img)
    plt.axis('off')
    plt.show()

def plot_class_distribution(df, title="Class Distribution"):
    """Plot class distribution"""
    plt.figure(figsize=(12, 6))
    df['class'].value_counts().plot(kind='bar')
    plt.title(title)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()