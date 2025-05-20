"use client";
import { useState } from "react";
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

export default function SignupStep3() {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };

  const validationArray = Yup.object({
    firstName: Yup.string().required("This field is required!"),
    lastName: Yup.string().required("This field is required!"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationArray,
    onSubmit: (values) => {
      console.log(values, "Signup values");
    },
  });

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
      <h1 className={styles.signupTitle}>
        Hey Peter, Let&apos;s setup your account.
      </h1>
      <form onSubmit={formik.handleSubmit}>
        <div className="row">{Object.values(mapData(stepTwoInfo))}</div>
      </form>
    </div>
  );
}
