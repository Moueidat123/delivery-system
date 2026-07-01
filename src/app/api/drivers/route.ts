import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/drivers
export async function GET() {
  const drivers = await prisma.driver.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { deliveries: true } } },
  });
  return NextResponse.json(drivers);
}

// POST /api/drivers
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Driver name is required." }, { status: 400 });
    }
    const driver = await prisma.driver.create({
      data: {
        name,
        phone: body.phone ? String(body.phone).trim() : null,
      },
    });
    return NextResponse.json(driver, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create driver." }, { status: 500 });
  }
}
