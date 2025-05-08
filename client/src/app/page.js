"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/atoms/buttons/CustomButton";
import styles from "./page.module.css";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = () => {
    signOut({ callbackUrl: "/signin" });
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/signin");
    return null;
  }

  return (
    <div className={styles.homeContainer}>
      <div className={styles.welcomeSection}>
        <h1>Welcome, {session?.user?.name || "User"}!</h1>
        <p>You are signed in with Google</p>
        {session?.user?.image && (
          <img 
            src={session.user.image} 
            alt="Profile" 
            className={styles.profileImage} 
          />
        )}
        <p>Email: {session?.user?.email}</p>
      </div>
      
      <CustomButton
        buttonType="primary"
        label="Logout"
        onClick={handleLogout}
      />
    </div>
  );
}
