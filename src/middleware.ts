import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Protect evaluator routes
  if (pathname.startsWith("/evaluator")) {
    if (!token || token.role !== "EVALUATOR") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Protect resident routes
  if (pathname.startsWith("/resident")) {
    if (!token || token.role !== "RESIDENT") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/evaluator/:path*",
    "/resident/:path*",
  ],
};
