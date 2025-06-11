import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { cookieUtils, COOKIE_NAMES } from "./utils/cookies";

export async function middleware(req) {
  // Check for NextAuth token (Google OAuth)
  const nextAuthToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  // Check for custom auth token in cookies (regular signin)
  const cookies = cookieUtils.parseFromRequest(req);
  const customAuthToken = cookies[COOKIE_NAMES.AUTH_TOKEN];
  
  // User is authenticated if either token exists
  const isAuthenticated = !!(nextAuthToken || customAuthToken);
  
  const { pathname } = req.nextUrl;

  // Allow public paths
  const publicPaths = [
    "/signin",
    "/signup", 
    "/api/auth",
    "/manifest.json",
    "/screenshots",
    "/assets",
    "/images",
    "/icons"
  ];
  
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path) || pathname === "/"
  );

  // Redirect authenticated users away from auth pages (signin/signup)
  if (isAuthenticated && (pathname.startsWith("/signin") || pathname.startsWith("/signup"))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect unauthenticated users to signin page if trying to access protected route
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest file)
     * - assets/ (assets folder)
     * - images/ (images folder)
     * - icons/ (icons folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|assets/|images/|icons/|signin|signup).*)",
  ],
}; 