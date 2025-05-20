"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/atoms/buttons/CustomButton";
import styles from "./page.module.css";
import { Button } from "@mui/material";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = () => {
    signOut({ callbackUrl: "/signin" });
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // if (status === "unauthenticated") {
  //   router.push("/signin");
  //   return null;
  // }

  return (
    <>
      <div className={styles.homeContainer}>
        {/* <div className={styles.welcomeSection}>
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
      </div> */}

        <div className={styles.homeGreeting}>
          <h1>
            Hello, <br />
            {session?.user?.name || "User"}{" "}
            <img
              src="/assets/images/wavingHand.png"
              alt="waving hand"
              width={36}
              height={36}
              className={styles.wavingHand}
            />
          </h1>
          <ol>
            <li className="line-through">Setup your account</li>
            <li>Watch a tutorial on how it works</li>
            <li>Have your first GesturePro conversation!</li>
          </ol>
        </div>
      </div>
      <div className={styles.homeModuleSection}>
        <Button className={styles.homeModule + " " + styles.gpVideo} onClick={()=>router.push("/video")}>
          <span>
            <h3>GesturePro Video</h3>
            <p>
              Instantly translate sign language to text or audio by pointing
              your camera at signers.
            </p>
          </span>
          <img src="/assets/images/camera.png" alt="camera icon" />
        </Button>
        <Button className={styles.homeModule + " " + styles.gpAudio}>
          <span>
            <h3>GesturePro Audio</h3>
            <p>
              Convert speech to text while an on-screen avatar translates it
              into ASL for you.
            </p>
          </span>
          <img src="/assets/images/mic.png" alt="mic icon" />
        </Button>
        <Button className={styles.homeModule + " " + styles.gpTranscripts}>
          <span>
            <h3>Transcripts</h3>
            <p>
              Save conversations for easy review, and revisit to understand past
              interactions better.
            </p>
          </span>
          <img src="/assets/images/folder.png" alt="folder icon" />
        </Button>
      </div>

      <CustomButton
        buttonType="primary"
        label="Logout"
        onClick={handleLogout}
      />
    </>
  );
}
