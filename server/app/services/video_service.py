import cv2
import numpy as np
import mediapipe as mp
import pickle
import os
from typing import Optional

class VideoService:
    def __init__(self):
        self.predicted_text = ""
        self.last_character = None
        
        self.labels = {
            "a": "a", "b": "b", "c": "c", "d": "d", "e": "e", "f": "f", "g": "g", "h": "h", "i": "i", 
            "j": "j", "k": "k", "l": "l", "m": "m", "n": "n", "o": "o", "p": "p", "q": "q", "r": "r", 
            "s": "s", "t": "t", "u": "u", "v": "v", "w": "w", "x": "x", "y": "y", "z": "z",
            "1": "Back Space", "2": "Clear", "3": "Space", "4": ""
        }
        
        self._load_model()
        
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False, 
            max_num_hands=1, 
            min_detection_confidence=0.9
        )

    def _load_model(self):
        """Load the ASL Random Forest model."""
        try:
            model_path = os.path.join(os.path.dirname(__file__), "../models/ASL_model.p")
            with open(model_path, "rb") as f:
                model = pickle.load(f)
            self.rf_model = model["model"]
        except FileNotFoundError:
            try:
                with open("./ASL_model.p", "rb") as f:
                    model = pickle.load(f)
                self.rf_model = model["model"]
            except FileNotFoundError:
                raise FileNotFoundError("ASL_model.p not found. Please ensure the model file is available.")

    def _process_frame_for_prediction(self, frame_content: bytes) -> str:
        """
        Process a single frame and predict the character.
        """
        try:
            nparr = np.frombuffer(frame_content, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                return ""

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            processed_image = self.hands.process(frame_rgb)
            hand_landmarks = processed_image.multi_hand_landmarks

            if hand_landmarks:
                for hand_landmark in hand_landmarks:
                    x_coordinates = [landmark.x for landmark in hand_landmark.landmark]
                    y_coordinates = [landmark.y for landmark in hand_landmark.landmark]
                    min_x, min_y = min(x_coordinates), min(y_coordinates)

                    normalized_landmarks = [
                        (landmark.x - min_x, landmark.y - min_y)
                        for landmark in hand_landmark.landmark
                    ]
                    sample = np.asarray(normalized_landmarks).reshape(1, -1)
                    predicted_character = self.rf_model.predict(sample)[0]
                    return self.labels.get(predicted_character, "")
            return ""
        except Exception as e:
            print(f"Error processing frame: {e}")
            return ""

    def predict_frame(self, frame_content: bytes) -> dict:
        """
        Process a video frame and return the predicted character and updated text.
        """
        predicted_character = self._process_frame_for_prediction(frame_content)

        if predicted_character == "Clear":
            self.predicted_text = ""
        elif predicted_character == "Space":
            self.predicted_text += " "
        elif predicted_character == "Back Space":
            self.predicted_text = self.predicted_text[:-1]
        elif predicted_character:
            self.predicted_text += predicted_character

        self.last_character = predicted_character

        return {
            "predicted_text": self.predicted_text,
            "predicted_character": predicted_character
        }

    def reset_capture(self) -> dict:
        """
        Reset the capture state, clearing all text and last character.
        """
        self.predicted_text = ""
        self.last_character = None
        return {"message": "Capture reset successfully"}

    def clear_text(self) -> dict:
        """
        Clear the current predicted text.
        """
        self.predicted_text = ""
        return {"message": "Text cleared successfully"} 