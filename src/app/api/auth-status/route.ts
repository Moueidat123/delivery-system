import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/auth-status -> whether access-code protection is enabled
export async function GET() {
  return NextResponse.json({ enabled: Boolean(process.env.ACCESS_CODE) });
}
