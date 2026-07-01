import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSerial } from "@/lib/utils";
import { Prisma } from "@prisma/client";

// Always return fresh data — never cache this route.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/deliveries?status=&driverId=&q=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const driverId = searchParams.get("driverId") || undefined;
  const q = searchParams.get("q")?.trim() || undefined;

  const where: Prisma.DeliveryWhereInput = {};
  if (status && ["PENDING", "DELIVERED", "CANCELLED"].includes(status)) {
    where.status = status;
  }
  if (driverId) where.driverId = driverId;
  if (q) {
    where.OR = [
      { serialNumber: { contains: q } },
      { productName: { contains: q } },
      { buyerName: { contains: q } },
      { buyerPhone: { contains: q } },
      { city: { contains: q } },
    ];
  }

  const deliveries = await prisma.delivery.findMany({
    where,
    include: { driver: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(deliveries);
}

// POST /api/deliveries
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const productName = String(body.productName || "").trim();
    const buyerName = String(body.buyerName || "").trim();
    const buyerPhone = String(body.buyerPhone || "").trim();

    if (!productName || !buyerName || !buyerPhone) {
      return NextResponse.json(
        { error: "productName, buyerName and buyerPhone are required." },
        { status: 400 }
      );
    }

    const price = Number(body.price) || 0;
    const deliveryPrice = Number(body.deliveryPrice) || 0;
    const driverGain = Number(body.driverGain) || 0;
    // totalPrice can be provided, otherwise computed
    const totalPrice =
      body.totalPrice !== undefined && body.totalPrice !== null && body.totalPrice !== ""
        ? Number(body.totalPrice)
        : price + deliveryPrice;

    // Use provided serial or generate a unique one
    let serialNumber = String(body.serialNumber || "").trim() || generateSerial();

    // Ensure serial is unique (retry a few times if generated collides)
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.delivery.findUnique({ where: { serialNumber } });
      if (!exists) break;
      if (body.serialNumber) {
        return NextResponse.json(
          { error: "A delivery with this serial number already exists." },
          { status: 409 }
        );
      }
      serialNumber = generateSerial();
    }

    const delivery = await prisma.delivery.create({
      data: {
        serialNumber,
        productName,
        buyerName,
        buyerPhone,
        address: body.address ? String(body.address).trim() : null,
        city: body.city ? String(body.city).trim() : null,
        notes: body.notes ? String(body.notes).trim() : null,
        price,
        deliveryPrice,
        totalPrice,
        driverGain,
        status: ["PENDING", "DELIVERED", "CANCELLED"].includes(body.status)
          ? body.status
          : "PENDING",
        driverId: body.driverId || null,
        deliveredAt:
          body.status === "DELIVERED" || body.status === "CANCELLED" ? new Date() : null,
      },
      include: { driver: { select: { id: true, name: true } } },
    });

    return NextResponse.json(delivery, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create delivery." }, { status: 500 });
  }
}
