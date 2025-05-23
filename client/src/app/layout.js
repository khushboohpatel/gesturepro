import { Livvic } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "../utils/ThemeRegistry";
import Skeleton from "./skeleton";
import NextAuthSessionProvider from "@/components/SessionProvider";
import AuthState from "./context/auth/authState";
import AlertState from "./context/alert/alertState";
import SnackbarState from "./context/snackbar/snackbarState";
import Alerts from "../utils/alert";

const livvic = Livvic({
  variable: "--font-livvic",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata = {
  title: "GesturePro",
  description: "Interactive Sign Language Translator",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GesturePro",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: [
      { url: "/assets/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/assets/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
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
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GesturePro" />
        <link rel="apple-touch-icon" href="/assets/icons/icon-192x192.png" />
      </head>
      <body className={`${livvic.variable} antialiased`}>
        <AuthState>
          <AlertState>
            <NextAuthSessionProvider>
              <ThemeRegistry>
                <SnackbarState>
                  <Skeleton>
                    <>
                      <Alerts />
                      {children}
                    </>
                  </Skeleton>
                </SnackbarState>
              </ThemeRegistry>
            </NextAuthSessionProvider>
          </AlertState>
        </AuthState>
      </body>
    </html>
  );
}
