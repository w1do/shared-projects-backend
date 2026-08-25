import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const role = request.cookies.get("auth_role")?.value;
  const { pathname } = request.nextUrl;

  // If not logged in and trying to access admin pages, redirect to login
  if (!token && pathname.startsWith("/admin")) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and trying to access login page, redirect to admin
  if (token && pathname === "/login") {
    const adminUrl = new URL("/admin", request.url);
    return NextResponse.redirect(adminUrl);
  }

  // RBAC Guarding Rules
  if (token && role && pathname.startsWith("/admin")) {
    // 1. Settings is admin-only
    if (pathname.startsWith("/admin/settings") && role !== "admin") {
      const unauthorizedUrl = new URL("/admin/unauthorized", request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    // 2. Team is admin/manager only
    if (pathname.startsWith("/admin/team") && role !== "admin" && role !== "manager") {
      const unauthorizedUrl = new URL("/admin/unauthorized", request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    // 3. Campaigns and Promotions are admin/manager only (staff blocked)
    if (
      (pathname.startsWith("/admin/campaigns") || pathname.startsWith("/admin/promotions")) &&
      role === "staff"
    ) {
      const unauthorizedUrl = new URL("/admin/unauthorized", request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
