import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;

  if (!session) {
    if (pathname !== "/login" && pathname !== "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (!session && pathname === "/role-selection") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login") {
    if (session.user.role === "operator") {
      return NextResponse.redirect(new URL("/station-dashboard", request.url));
    } else if (session.user.role === "owner") {
      return NextResponse.redirect(new URL("/ev-owner-dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/role-selection", request.url));
    }
  }

  if (session.user.role === null) {
    if (pathname !== "/role-selection") {
      return NextResponse.redirect(new URL("/role-selection", request.url));
    }
    return NextResponse.next();
  }

  if (session.user.role === "owner" && pathname === "/station-dashboard") {
    return NextResponse.redirect(new URL("/ev-owner-dashboard", request.url));
  }

  if (session.user.role === "operator" && pathname === "/ev-owner-dashboard") {
    return NextResponse.redirect(new URL("/station-dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/ev-owner-dashboard",
    "/station-dashboard",
    "/role-selection",
    "/operator-onboarding",
  ],
};
