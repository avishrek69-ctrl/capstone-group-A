import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/planner",
  "/shoots",
  "/locations",
];

const AUTH_PAGES = ["/", "/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for token in cookie (the backend still sends it, though browser might not store it)
  const token = request.cookies.get("token")?.value;

  // Redirect logged-in users away from public auth pages to dashboard
  if (token && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // NOTE: We don't protect dashboard/planner/shoots/locations here with middleware
  // because the browser may not have the token cookie due to CORS/SameSite restrictions
  // Instead, each page has its own auth guard using Zustand store
  // This allows the page to load and check auth on the client side

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/planner/:path*",
    "/shoots/:path*",
    "/locations/:path*",
  ],
};
