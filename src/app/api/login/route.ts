import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/login  { code }
export async function POST(req: Request) {
  const expected = process.env.ACCESS_CODE;
  if (!expected) {
    // Protection is not enabled — nothing to log into.
    return NextResponse.json({ ok: true, disabled: true });
  }

  let code = "";
  try {
    const body = await req.json();
    code = String(body.code || "");
  } catch {
    // ignore
  }

  if (code && code === expected) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("access", code, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  }

  return NextResponse.json({ error: "Wrong access code." }, { status: 401 });
}
