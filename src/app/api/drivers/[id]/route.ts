import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/drivers/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.phone !== undefined) data.phone = body.phone ? String(body.phone).trim() : null;
    if (body.active !== undefined) data.active = Boolean(body.active);

    const driver = await prisma.driver.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(driver);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update driver." }, { status: 500 });
  }
}

// DELETE /api/drivers/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.driver.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete driver." }, { status: 500 });
  }
}
