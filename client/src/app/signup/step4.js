"use client";

import CustomButton from "@/components/atoms/buttons/CustomButton";
import Image from "next/image";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function SignupStep4() {
  const router = useRouter();

  return (
    <div className={styles.signupCnt + " " + styles.finalStep}>
      <Image
        src="/assets/svg/logo.svg"
        alt="GesturePro logo"
        className={styles.logoImg + " mx-auto"}
        width={125}
        height={35}
      />
      <div className={styles.signupImgCnt}>
        <Image
          src="/assets/svg/signup_4.svg"
          alt="signup"
          className={styles.signupImg}
          width={250}
          height={250}
        />
      </div>
      
      <h1 className={styles.signupTitle + " " + "text-center"}>You are all set!</h1>
      <CustomButton label="Let's begin" size="large" onClick={()=>router.push("/signin")}/>
    </div>
  );
}
