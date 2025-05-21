"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import CustomButton from "@/components/atoms/buttons/CustomButton";
import Image from "next/image";
import { Box } from "@mui/system";
import styles from "./page.module.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import { mapData } from "@/utils";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";

function SignIn() {
  const [defaultSignin, setDefaultSignIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

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
      console.log(values, "Login values");
    },
  });

  const loginInfo = [
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
    <Box sx={{ flexGrow: 1, p: 2 }} className={styles.loginContainer}>
      <div className={styles.loginImgCnt}>
        <Image
          src="/assets/svg/thumb1.svg"
          alt="thumb"
          className={styles.thumb1}
          width={115}
          height={70}
        />
        <Image
          src="/assets/svg/thumb2.svg"
          alt="thumb"
          className={styles.thumb2}
          width={110}
          height={250}
        />
        <Image
          src="/assets/svg/thumb3.svg"
          alt="thumb"
          className={styles.thumb3}
          width={150}
          height={215}
        />
      </div>
      <Image
        src="/assets/svg/logo.svg"
        alt="GesturePro logo"
        className={styles.logoImg}
        width={125}
        height={35}
      />
      <h1 className={styles.loginTitle}>Sign in to your account</h1>
      <div >
        {defaultSignin ? (
          <form onSubmit={formik.handleSubmit}>
            <div className="row">{Object.values(mapData(loginInfo))}</div>
            <CustomButton
              label="Login"
              size="large"
              type="submit"
              className={styles.loginBtn}
            />
          </form>
        ) : (
          <div className={styles.loginTypeBtn}>
            <CustomButton
              buttonType="tertiary"
              label="Continue with your email"
              onClick={() => setDefaultSignIn(true)}
              endIcon={
                <Image
                  src="/assets/svg/mailIcon.svg"
                  alt="mail"
                  width={24}
                  height={24}
                />
              }
            />
            <CustomButton
              buttonType="tertiary"
              label="Sign in with Google"
              onClick={handleGoogleSignIn}
              endIcon={
                <Image
                  src="/assets/svg/googleIcon.svg"
                  alt="google"
                  width={24}
                  height={24}
                />
              }
            />
          </div>
        )}

        <div className={styles.signupLink}>
          Don&apos;t have an account?{" "}
          <button
            onClick={() => router.push("/signup")}
            className={styles.linkButton}
          >
            Sign up
          </button>
        </div>
      </div>
    </Box>
  );
}

export default SignIn;