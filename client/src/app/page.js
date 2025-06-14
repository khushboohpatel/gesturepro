"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/atoms/buttons/CustomButton";
import styles from "./page.module.css";
import { Button } from "@mui/material";
import { useEffect, useState, useContext } from "react";
import Cookies from 'js-cookie';
import AuthContext from "./context/auth/authContext";

export default function Home() {
  const { data: session, status } = useSession();
  const nextAuthSession = session;
  const router = useRouter();
  const [username, setUsername] = useState("User");

  const authContext = useContext(AuthContext);
  const { logout, user: contextUser } = authContext;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem("username") || sessionStorage.getItem("username");
      if (storedUsername) {
        setUsername(storedUsername);
      }
    }
  }, []);

  const handleLogout = async () => {
    if (logout) {
      await logout();
    } else {
      console.error("Auth context logout not available, falling back to manual cleanup");
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("username");
        sessionStorage.removeItem("username");
        Cookies.remove('auth_token', { path: '/' });
      }
      signOut({ callbackUrl: "/signin" });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localToken = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (session != null) {
        if (status === "unauthenticated" && !localToken) {
          router.push("/signin");
        }
      }
      else if (!localToken) {
        router.push("/signin");
      }
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  const user = contextUser ?
    { name: `${contextUser.first_name} ${contextUser.last_name}`.trim() || contextUser.email } :
    nextAuthSession?.user || { name: username };

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
            {user.name}{" "}
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
        <Button className={styles.homeModule + " " + styles.gpVideo} onClick={() => router.push("/video")}>
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
      // onClick={() => Cookies.remove('auth_token', { path: '/' })
      // }
      />
    </>
  );
}
