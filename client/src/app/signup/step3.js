"use client";
import { useState, useContext, useEffect } from "react";
import CustomButton from "@/components/atoms/buttons/CustomButton";
import Image from "next/image";
import styles from "./page.module.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import { mapData } from "@/utils";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import AuthContext from "../context/auth/authContext";
import AlertContext from "../context/alert/alertContext";
import SnackbarContext from "../context/snackbar/snackbarContext";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import EastIcon from "@mui/icons-material/East";

export default function SignupStep3({ handleNext, step2Values }) {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const { setAlert } = alertContext;
  const { register, responseStatus, clearResponse } = authContext;

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };

  const validationArray = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("This field is required!"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      )
      .required("This field is required!"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationArray,
    onSubmit: async (values) => {
      try {
        await register({
          first_name: step2Values.first_name,
          last_name: step2Values.last_name,
          ...values,
        });
      } catch (error) {
        showSnackbar("Registration failed. Please try again!", "error"); // or 'error', 'warning', 'info'
      }
    },
  });

  useEffect(() => {
    if (responseStatus) {
      if (responseStatus.status === "SUCCESS") {
        showSnackbar("Registered successfully!", "success");
        clearResponse();
        router.push("/login");

        console.log("Login Success 1");
      } else if (responseStatus.status === "error") {
        showSnackbar("Something went wrong!", "error");
        clearResponse();
      }
    }
  }, [responseStatus]);

  const stepTwoInfo = [
    {
      label: "Email address",
      name: "email",
      type: "text",
      placeholder: "Enter your email address",
      class: "col-12",
      formik: formik,
    },
    {
      label: "Password",
      name: "password",
      type: showPassword ? "text" : "password",
      placeholder: "Enter your password",
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            aria-label={
              showPassword ? "hide the password" : "display the password"
            }
            onClick={handleClickShowPassword}
            onMouseDown={handleMouseDownPassword}
            onMouseUp={handleMouseUpPassword}
            edge="end"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
      class: "col-12",
      formik: formik,
    },
  ];

  return (
    <div className={styles.signupCnt}>
      <div className={styles.signupImgCnt}>
        <Image
          src="/assets/svg/signup_3.svg"
          alt="signup"
          className={styles.signupImg}
          width={250}
          height={250}
        />
      </div>
      <Image
        src="/assets/svg/logo.svg"
        alt="GesturePro logo"
        className={styles.logoImg}
        width={125}
        height={35}
      />
      <h1 className={styles.signupTitle}>Let&apos;s setup your account.</h1>
      <form onSubmit={formik.handleSubmit}>
        <div className="row">
          {Object.values(mapData(stepTwoInfo))}
          <div className="col-12 mt-3 d-flex justify-content-end">
            {/* <CustomButton
              type="submit"
              label="Create Account"
              disabled={formik.isSubmitting}
            /> */}
            <Button
              size="small"
              type="submit"
              disabled={formik.isSubmitting}
              className="signupNextBtn"
            >
              <EastIcon />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
