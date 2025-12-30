import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;

  // console.log("Middleware check:", {
  //   pathname,
  //   hasSession: !!session,
  //   userId: session?.user?.id,
  //   role: session?.user?.role,
  // });

  // Unauthenticated users can only access /login
  if (!session) {
    if (pathname !== "/login" && pathname !== "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Unauthenticated users cannot access /role-selection
  if (!session && pathname === "/role-selection") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Authenticated users cannot access /login
  if (pathname === "/login") {
    // Redirect to dashboard based on role
    if (session.user.role === "operator") {
      return NextResponse.redirect(new URL("/station-dashboard", request.url));
    } else if (session.user.role === "owner") {
      return NextResponse.redirect(new URL("/ev-owner-dashboard", request.url));
    } else {
      // No role assigned yet - go to role selection
      return NextResponse.redirect(new URL("/role-selection", request.url));
    }
  }

  // First-time users (role = null or no role) must go to role-selection
  if (session.user.role === null) {
    if (pathname !== "/role-selection") {
      return NextResponse.redirect(new URL("/role-selection", request.url));
    }
    return NextResponse.next();
  }

  // Owners cannot access operator routes
  if (session.user.role === "owner" && pathname === "/station-dashboard") {
    return NextResponse.redirect(new URL("/ev-owner-dashboard", request.url));
  }

  // Operators cannot access owner routes
  if (session.user.role === "operator" && pathname === "/ev-owner-dashboard") {
    return NextResponse.redirect(new URL("/station-dashboard", request.url));
  }

  // Operators cannot access operator-onboarding after initial setup
  if (session.user.role === "operator" && pathname === "/operator-onboarding") {
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
