"use client";
import "./globals.css";
import { useEffect, useState, useContext } from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SplashScreen from "@/components/SplashScreen";
import AuthContext from "./context/auth/authContext";

export default function Skeleton({ children }) {
  const [value, setValue] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const nextAuthAuthenticated = status === "authenticated";
    const customAuthAuthenticated = authContext?.isAuthenticated;

    const userAuthenticated = nextAuthAuthenticated || customAuthAuthenticated;

    setIsAuthenticated(userAuthenticated);
  }, [status, authContext?.isAuthenticated, authContext?.token]);

  return (
    <>
      <SplashScreen onLoadingComplete={() => setIsLoading(false)} />
      {!isLoading && (
        <div
          className={`desktopContainer ${isAuthenticated ? "authenticated" : ""
            }`}
        >
          {children}
          {isAuthenticated ? (
            <BottomNavigation
              showLabels={true}
              value={value}
              onChange={(event, newValue) => {
                setValue(newValue);
              }}
            >
              <BottomNavigationAction
                label="Transcripts"
                icon={
                  <img src="/assets/svg/transcripts.svg" alt="transcripts icon" />
                }
              />
              <BottomNavigationAction
                label="Home"
                icon={<img src="/assets/svg/home.svg" alt="home icon" />}
                onClick={() => router.push("/")}
              />
              <BottomNavigationAction
                label="Profile"
                icon={<img src="/assets/svg/profile.svg" alt="profile icon" />}
              />
            </BottomNavigation>
          ) : null}
        </div>
      )}
    </>
  );
}
