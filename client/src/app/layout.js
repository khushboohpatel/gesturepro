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
