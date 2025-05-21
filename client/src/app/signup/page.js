"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import SignupStep1 from "./step1";
import styles from "./page.module.css";
import EastIcon from "@mui/icons-material/East";
import SignupStep2 from "./step2";
import SignupStep3 from "./step3";
import SignupStep4 from "./step4";
import AuthState from "../context/auth/authState";
import AlertState from "../context/alert/alertState";

// Custom stepper to avoid MUI's theme-dependent components
const CustomStepper = ({
  steps,
  activeStep,
  className,
  nextButton,
  backButton,
}) => {
  return (
    <div className={className || styles.customStepper}>
      <div className={styles.stepperBack}>{backButton}</div>
      <div className={styles.stepperDots}>
        {Array.from({ length: steps }).map((_, index) => (
          <div
            key={index}
            className={`${styles.stepperDot} ${
              index === activeStep ? styles.activeDot : ""
            }`}
          />
        ))}
      </div>
      <div className={styles.stepperNext}>{nextButton}</div>
    </div>
  );
};

export default function Signup() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [step2Values, setStep2Values] = React.useState({});
  const maxSteps = 3;

  const handleNext = (stepData) => {
    if (stepData) {
      setStep2Values(prev => ({ ...prev, ...stepData }));
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <AuthState>
      <AlertState>
        <Box sx={{ flexGrow: 1, p: 2 }} className={styles.authContainer}>
          {/* <Paper
            square
            elevation={0}
            sx={{
              display: "flex",
              alignItems: "center",
              height: 50,
              pl: 2,
              bgcolor: "background.default",
            }}
          >
             <Typography>{steps[activeStep].label}</Typography> 
          </Paper>*/}
          {/* <Box sx={{ width: "100%", mb: 2 }}> */}
            {activeStep === 0 ? (
              <SignupStep1 handleNext={handleNext} />
            ) : activeStep === 1 ? (
              <SignupStep2 handleNext={handleNext} />
            ) : activeStep === 2 ? (
              <SignupStep3 handleNext={handleNext} step2Values={step2Values} />
            ) : (
              <SignupStep4 />
            )}
          {/* </Box> */}
          <CustomStepper
            steps={maxSteps}
            activeStep={activeStep}
            className={`${styles.signupStepperBar} ${
              activeStep === maxSteps || activeStep === 0 ? "d-none" : ""
            }`}
            nextButton={
              <Button
                size="small"
                onClick={handleNext}
                disabled={activeStep === maxSteps}
                className={`signupNextBtn ${activeStep === 0 ? "d-none" : ""}`}
              >
                <EastIcon />
              </Button>
            }
            backButton={
              <Button
                size="small"
                onClick={handleBack}
                disabled={activeStep === 0}
                className={`signupBackBtn ${activeStep === 0 ? "d-none" : ""}`}
              >
                <KeyboardArrowLeft />
                Back
              </Button>
            }
          />
        </Box>
      </AlertState>
    </AuthState>
  );
}
