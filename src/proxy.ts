import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = [
  "/dashboard",
  "/summarize",
  "/quiz",
  "/explain",
  "/improve",
  "/flashcards",
  "/planner",
  "/history",
  "/voice-assistant",
  "/settings",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const session = request.cookies.get("studymate_session");
  if (!session?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/summarize/:path*",
    "/quiz/:path*",
    "/explain/:path*",
    "/improve/:path*",
    "/flashcards/:path*",
    "/planner/:path*",
    "/history/:path*",
    "/voice-assistant/:path*",
    "/settings/:path*",
  ],
};

