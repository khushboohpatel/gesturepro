import { Livvic } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "../utils/ThemeRegistry";
import Skeleton from "./skeleton";
import NextAuthSessionProvider from "@/components/SessionProvider";
import AuthState from "./context/auth/authState";
import AlertState from "./context/alert/alertState";
import SnackbarState from "./context/snackbar/snackbarState";
import Alerts from "../utils/alert";
import VideoTranslationState from "./context/videoTranslation/videoTranslationState";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const livvic = Livvic({
  variable: "--font-livvic",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata = {
  title: "GesturePro",
  description: "Interactive Sign Language Translator",
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: "/assets/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/assets/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/assets/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
          integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z"
          crossOrigin="anonymous"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3359C6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GesturePro" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="GesturePro" />
        <meta name="msapplication-TileColor" content="#3359C6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="apple-touch-icon" href="/assets/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/assets/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/assets/icons/icon-512x512.png" />
      </head>
      <body className={`${livvic.variable} antialiased`}>
        <AuthState>
          <AlertState>
            <VideoTranslationState>
              <NextAuthSessionProvider>
                <ThemeRegistry>
                  <SnackbarState>
                    <Skeleton>
                      <>
                        <Alerts />
                        {children}
                        <PWAInstallPrompt />
                      </>
                    </Skeleton>
                  </SnackbarState>
                </ThemeRegistry>
              </NextAuthSessionProvider>
            </VideoTranslationState>
          </AlertState>
        </AuthState>
      </body>
    </html>
  );
}
