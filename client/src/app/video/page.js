"use client";
import { useRef, useState, useContext, useCallback, useEffect } from "react";
import { Button } from "@mui/material";
import Webcam from "react-webcam";
import styles from "./page.module.css";
import VideoTranslationContext from "../context/videoTranslation/videoTranslationContext";
import SnackbarContext from "../context/snackbar/snackbarContext";

export default function GPVideo() {
  const videoTranslationContext = useContext(VideoTranslationContext);
  const {
    startPredictingWordTokens,
    endPredictingWordTokens,
    videoTranscript,
    responseStatus,
    clearResponse,
  } = videoTranslationContext;

  const { showSnackbar } = useContext(SnackbarContext);

  const webcamRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [cameraError, setCameraError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSecureContext, setIsSecureContext] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [predictedText, setPredictedText] = useState("");
  const captureInterval = useRef(null);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent.toLowerCase()));
    };
    checkMobile();

    // Check if running in secure context
    setIsSecureContext(window.isSecureContext);

    // Cleanup on unmount
    return () => {
      if (captureInterval.current) {
        clearInterval(captureInterval.current);
      }
    };
  }, []);

  const videoConstraints = {
    width: { min: 320, ideal: 640, max: 1280 },
    height: { min: 240, ideal: 480, max: 720 },
    facingMode: isMobile ? "environment" : "user",
    aspectRatio: { ideal: 1.333333 },
  };

  const handleCameraError = useCallback(
    (error) => {
      console.error("Camera error:", error);
      let errorMessage = "Failed to access camera";

      if (!isSecureContext) {
        errorMessage = "Camera access requires a secure (HTTPS) connection";
      } else if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        errorMessage = "Your browser doesn't support camera access";
      } else if (error.name === "NotAllowedError") {
        errorMessage =
          "Camera access was denied. Please allow camera access in your browser settings.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "No camera found on your device";
      } else if (error.name === "NotReadableError") {
        errorMessage = "Camera is already in use by another application";
      }

      setCameraError(errorMessage);
      setIsCameraOn(false);
    },
    [isSecureContext]
  );

  const captureFrame = async () => {
    if (!webcamRef.current || !webcamRef.current.video) return;

    const video = webcamRef.current.video;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error("Failed to create a Blob from the canvas.");
        return;
      }

      const formData = new FormData();
      formData.append("frame", blob, "frame.jpg");
      try {
        await startPredictingWordTokens(formData);
      } catch (err) {
        showSnackbar("Failed to fetch tokens. Please try again!", "error");
      }
    }, "image/jpeg");
  };

  useEffect(() => {
    console.log("VideoTranscript changed:", videoTranscript);
    if (videoTranscript && videoTranscript.predicted_text) {
      console.log("Predicted text:", videoTranscript.predicted_text);
      console.log("Predicted character:", videoTranscript.predicted_character);
      setPredictedText(videoTranscript.predicted_text);
    } else {
      console.log("No valid character detected or videoTranscript is null");
      setPredictedText("");
    }
  }, [videoTranscript]);

  const handleStartCapture = () => {
    setIsCapturing(true);

    if (captureInterval.current) {
      clearInterval(captureInterval.current);
    }

    captureInterval.current = setInterval(captureFrame, 1500);
  };

  const handleStopCapture = async () => {
    setIsCapturing(false);

    if (captureInterval.current) {
      clearInterval(captureInterval.current);
      captureInterval.current = null;
    }

    try {
      endPredictingWordTokens();
      setPredictedText("");
      setCurrentWordIndex(-1);
      clearResponse();
      setIsSpeaking(false);
    } catch (error) {
      console.error("Error resetting capture:", error);
    }
  };

  const toggleCamera = useCallback(() => {
    setCameraError(null);
    if (!isSecureContext) {
      setCameraError("Camera access requires a secure (HTTPS) connection");
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Your browser doesn't support camera access");
      return;
    }

    if (isCameraOn) {
      if (isCapturing) {
        handleStopCapture();
      }
      setIsCameraOn(false);
      handleStartCapture();
    } else {
      setIsCameraOn(true);
      handleStartCapture();
    }
  }, [isSecureContext, isCameraOn, isCapturing]);

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentWordIndex(-1);
      };

      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const words = text.split(" ");
          const wordIndex = words.findIndex((word, index) => {
            const position = words.slice(0, index).join(" ").length + index;
            return position >= event.charIndex;
          });
          setCurrentWordIndex(wordIndex);
        }
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSpeakClick = () => {
    const textToSpeak = predictedText || "No transcription available.";
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      speakText(textToSpeak);
    }
  };

  return (
    <div className="">
      {cameraError && (
        <div className={styles.errorMessage}>
          <p>Camera Error: {cameraError}</p>
          <p>Please ensure camera permissions are granted and try again.</p>
        </div>
      )}
      <div className={isCameraOn ? styles.camCntOn : styles.camCntOff}>
        {isCameraOn && (
          <Webcam
            audio={false}
            ref={webcamRef}
            videoConstraints={videoConstraints}
            className="w-full h-full object-cover"
            onUserMediaError={handleCameraError}
            mirrored={!isMobile}
          />
        )}
      </div>
      {isCameraOn ? (
        <div className={styles.camTranscript}>
          <p>{predictedText || "No transcription available."}</p>
          <Button className="transcriptAudioBtn" onClick={handleSpeakClick}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isSpeaking ? (
                <path
                  d="M12.5 6.97499V6.17499C12.5 3.69165 10.775 2.74165 8.67496 4.05832L6.24163 5.58332C5.97496 5.74165 5.66663 5.83332 5.35829 5.83332H4.16663C2.49996 5.83332 1.66663 6.66665 1.66663 8.33332V11.6667C1.66663 13.3333 2.49996 14.1667 4.16663 14.1667H5.83329"
                  stroke="#3359C6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M1.66669 8.33332V11.6667C1.66669 13.3333 2.50002 14.1667 4.16669 14.1667H5.35835C5.66669 14.1667 5.97502 14.2583 6.24169 14.4167L8.67502 15.9417C10.775 17.2583 12.5 16.3 12.5 13.825V6.17499C12.5 3.69165 10.775 2.74165 8.67502 4.05832L6.24169 5.58332C5.97502 5.74165 5.66669 5.83332 5.35835 5.83332H4.16669C2.50002 5.83332 1.66669 6.66665 1.66669 8.33332Z"
                  stroke="#3359C6"
                  strokeWidth="1.5"
                />
              )}
              <path
                d="M15 6.6665C16.4833 8.6415 16.4833 11.3582 15 13.3332"
                stroke="#3359C6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.525 4.5835C18.9334 7.79183 18.9334 12.2085 16.525 15.4168"
                stroke="#3359C6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>

          {/* <Button 
            onClick={isCapturing ? handleStopCapture : handleStartCapture}
            variant="contained"
            color={isCapturing ? "secondary" : "primary"}
            style={{ marginLeft: '10px' }}
          >
            {isCapturing ? "Stop Capture" : "Start Capture"}
          </Button> */}
        </div>
      ) : null}

      <div className={styles.toggleCamCnt}>
        <Button
          size="small"
          onClick={toggleCamera}
          className={styles.toggleCamBtn}
        >
          <span className={isCameraOn ? styles.camOff : styles.camOn}></span>
        </Button>
        <small>{isCameraOn ? "Tap to end" : "Tap to start"}</small>
      </div>
    </div>
  );
}
