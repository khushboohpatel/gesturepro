"use client";

import CustomButton from "@/components/atoms/buttons/CustomButton";
import Image from "next/image";
import styles from "./page.module.css";
import { signIn } from "next-auth/react";

export default function SignupStep1({ handleNext }) {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className={styles.signupCnt}>
      <div className={styles.signupImgCnt}>
        <Image
          src="/assets/svg/signup_1.svg"
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
      <h1 className={styles.signupTitle}>Create a new account!</h1>
      <div className={styles.signupTypeBtn}>
        <CustomButton
          buttonType="tertiary"
          label="Continue with your email"
          onClick={handleNext}
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
          label="Signup with Google"
          onClick={handleGoogleSignIn}
          endIcon={
            <Image
              src="/assets/svg/googleIcon.svg"
              alt="mail"
              width={24}
              height={24}
            />
          }
        />
      </div>
    </div>
  );
}
