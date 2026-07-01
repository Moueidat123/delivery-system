import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/logout -> clears the access cookie
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("access", "", { path: "/", maxAge: 0 });
  return res;
}
