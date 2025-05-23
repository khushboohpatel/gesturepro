import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Allow public paths
  const publicPaths = [
    "/signin",
    "/signup",
    "/api/auth",
    "/manifest.json",
  ];
  
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path) || pathname === "/"
  );

  // Redirect authenticated users away from auth pages (signin/signup)
  if (token && (pathname.startsWith("/signin") || pathname.startsWith("/signup"))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect unauthenticated users to signin page if trying to access protected route
  if (!token && !isPublicPath) {
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