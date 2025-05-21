"use client";

import CustomButton from "@/components/atoms/buttons/CustomButton";
import Image from "next/image";
import styles from "./page.module.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import { mapData } from "@/utils";

export default function SignupStep2({ handleNext }) {
  const validationArray = Yup.object({
    firstName: Yup.string().required("This field is required!"),
    lastName: Yup.string().required("This field is required!"),
  });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
    },
    validationSchema: validationArray,
    onSubmit: async (values) => {
      handleNext(values);
    },
  });

  const stepTwoInfo = [
    {
      label: "First name",
      name: "firstName",
      type: "text",
      placeholder: "Enter your first name",
      class: "col-12",
      formik: formik,
    },
    {
      label: "Last name",
      name: "lastName",
      type: "text",
      placeholder: "Enter your last name",
      class: "col-12",
      formik: formik,
    },
  ];

  return (
    <div className={styles.signupCnt}>
      <div className={styles.signupImgCnt}>
        <Image
          src="/assets/svg/signup_2.svg"
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
      <h1 className={styles.signupTitle}>What should we call you?</h1>
      <form onSubmit={formik.handleSubmit}>
        <div className="row">
          {Object.values(mapData(stepTwoInfo))}
          <div className="col-12 mt-3">
            <CustomButton 
              type="submit"
              label="Next" 
              disabled={formik.isSubmitting}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
