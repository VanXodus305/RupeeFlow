import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;

  console.log("Middleware check:", {
    pathname,
    hasSession: !!session,
    userId: session?.user?.id,
    isFirstLogin: session?.user?.isFirstLogin,
    role: session?.user?.role,
  });

  // Redirect unauthenticated users to login
  if (
    !session &&
    (pathname === "/ev-owner-dashboard" ||
      pathname === "/station-dashboard" ||
      pathname === "/role-selection" ||
      pathname === "/operator-onboarding")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from login
  if (session && pathname === "/login") {
    // First-time Google users should go to role-selection
    if (session.user.isFirstLogin && !session.user.id.startsWith("demo-")) {
      return NextResponse.redirect(new URL("/role-selection", request.url));
    }
    if (session.user.role === "operator") {
      return NextResponse.redirect(new URL("/station-dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/ev-owner-dashboard", request.url));
  }

  // First-time Google users must complete role selection before accessing dashboards
  if (
    session &&
    session.user.isFirstLogin &&
    !session.user.id.startsWith("demo-") &&
    pathname !== "/role-selection"
  ) {
    return NextResponse.redirect(new URL("/role-selection", request.url));
  }

  // Redirect users who have completed role selection away from role-selection page
  if (
    session &&
    !session.user.isFirstLogin &&
    !session.user.id.startsWith("demo-") &&
    pathname === "/role-selection"
  ) {
    // Redirect to their appropriate dashboard based on role
    if (session.user.role === "operator") {
      return NextResponse.redirect(new URL("/station-dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/ev-owner-dashboard", request.url));
  }

  // Prevent owners from accessing operator dashboard
  if (
    session &&
    pathname === "/station-dashboard" &&
    session.user.role === "owner"
  ) {
    return NextResponse.redirect(new URL("/ev-owner-dashboard", request.url));
  }

  // Prevent operators from accessing owner dashboard
  if (
    session &&
    pathname === "/ev-owner-dashboard" &&
    session.user.role === "operator"
  ) {
    return NextResponse.redirect(new URL("/station-dashboard", request.url));
  }

  // Prevent non-operators from accessing operator onboarding
  if (
    session &&
    pathname === "/operator-onboarding" &&
    session.user.role === "owner"
  ) {
    return NextResponse.redirect(new URL("/ev-owner-dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/ev-owner-dashboard",
    "/station-dashboard",
    "/role-selection",
    "/operator-onboarding",
    "/login",
  ],
};
