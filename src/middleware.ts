import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that are always reachable without an access code.
const PUBLIC_PATHS = ["/login", "/api/login", "/api/logout", "/api/auth-status"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The access code is set via the ACCESS_CODE environment variable.
  // If it is NOT set, protection is disabled (handy for first-time/local use).
  const code = process.env.ACCESS_CODE;
  if (!code) return NextResponse.next();

  // Always allow the login page + auth endpoints.
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Valid cookie? Let them through.
  const cookie = req.cookies.get("access")?.value;
  if (cookie === code) return NextResponse.next();

  // Block API calls with a 401.
  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Otherwise redirect to the login page.
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

// Run on everything except Next.js internals and static assets.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp|txt)).*)",
  ],
};
