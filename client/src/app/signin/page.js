// client/src/app/signin/page.js
'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box } from '@mui/system';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CustomButton from '@/components/atoms/buttons/CustomButton';
import Image from 'next/image';
import { mapData } from '@/utils';
import { showSnackbar } from '@/utils/snackbar';          // ← your snackbar util
import AuthContext from "../context/auth/authContext";
import styles from './page.module.css';
import AlertContext from "../context/alert/alertContext";
import SnackbarContext from "../context/snackbar/snackbarContext";

export default function SignIn() {
  const [defaultSignin, setDefaultSignIn] = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const authContext = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);

  const router = useRouter();
  const { status } = useSession();
  const { login, responseStatus, clearResponse } = authContext;

  // if already signed in via NextAuth or AuthState, redirect
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  const handleClickShowPassword = () => setShowPassword((s) => !s);
  const handleMouseDownPassword = (e) => e.preventDefault();
  const handleMouseUpPassword   = (e) => e.preventDefault();


  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email:    Yup.string().email('Invalid email').required('Email field is required!'),
      password: Yup.string().required('Password field is required!'),
    }),
    onSubmit: async (values) => {
      try {
        await login({
          email: values.email,
          password: values.password,
        });
      } catch (err) {
        showSnackbar('Login failed. Please try again!', 'error');
      }
    },
  });

  useEffect(() => {
    if (responseStatus) {
      if (responseStatus.status === "SUCCESS") {
        showSnackbar("Logged in successfully!", "success");
        clearResponse();
        router.push("/");
      } else if (responseStatus.status === "error") {
        showSnackbar(responseStatus?.message, "error");
        clearResponse();
      }
    }
  }, [responseStatus]);

  const loginInfo = [
    {
      label: 'Email address',
      name: 'email',
      type: 'text',
      placeholder: 'Enter your email address',
      class: "col-12",
      formik,
    },
    {
      label: 'Password',
      name: 'password',
      type: showPassword ? 'text' : 'password',
      class: "col-12",
      placeholder: 'Enter your password',
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            aria-label={showPassword ? 'hide password' : 'show password'}
            onClick={handleClickShowPassword}
            onMouseDown={handleMouseDownPassword}
            onMouseUp={handleMouseUpPassword}
            edge="end"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
      formik,
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 2 }} className={styles.loginContainer}>
      <div className={styles.loginImgCnt}>
        <Image src="/assets/svg/thumb1.svg" alt="thumb" width={115} height={70} className={styles.thumb1} />
        <Image src="/assets/svg/thumb2.svg" alt="thumb" width={110} height={250} className={styles.thumb2} />
        <Image src="/assets/svg/thumb3.svg" alt="thumb" width={150} height={215} className={styles.thumb3} />
      </div>

      <Image src="/assets/svg/logo.svg" alt="GesturePro logo" width={125} height={35} className={styles.logoImg} />

      <h1 className={styles.loginTitle}>Sign in to your account!</h1>

      {defaultSignin ? (
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="row">{Object.values(mapData(loginInfo))}</div>
          <CustomButton
            label="Login"
            size="large"
            type="submit"
            className={styles.loginBtn}
            disabled={formik.isSubmitting}
          />
        </form>
      ) : (
        <div className={styles.loginTypeBtn}>
          <CustomButton
            buttonType="tertiary"
            label="Continue with your email"
            onClick={() => setDefaultSignIn(true)}
            endIcon={<Image src="/assets/svg/mailIcon.svg" alt="mail" width={24} height={24} />}
          />
          <CustomButton
            buttonType="tertiary"
            label="Sign in with Google"
            onClick={handleGoogleSignIn}
            endIcon={<Image src="/assets/svg/googleIcon.svg" alt="google" width={24} height={24} />}
          />
        </div>
      )}

      <div className={styles.signupLink}>
        Don&apos;t have an account?{' '}
        <button onClick={() => router.push('/signup')} className={styles.linkButton}>
          Sign up
        </button>
      </div>
    </Box>
  );
}