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
  const token = request.cookies.get("token")?.value;

  // Redirect logged-in users away from public auth pages to dashboard
  if (token && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

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
