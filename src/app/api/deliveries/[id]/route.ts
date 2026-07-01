import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/deliveries/:id  -> update fields or status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    const stringFields = [
      "productName",
      "buyerName",
      "buyerPhone",
      "address",
      "city",
      "notes",
      "serialNumber",
    ];
    for (const f of stringFields) {
      if (body[f] !== undefined) data[f] = body[f] === "" ? null : String(body[f]).trim();
    }

    const numberFields = ["price", "deliveryPrice", "totalPrice", "driverGain"];
    for (const f of numberFields) {
      if (body[f] !== undefined) data[f] = Number(body[f]) || 0;
    }

    // Recompute total if price/deliveryPrice changed but total not explicitly sent
    if (
      (body.price !== undefined || body.deliveryPrice !== undefined) &&
      body.totalPrice === undefined
    ) {
      const current = await prisma.delivery.findUnique({ where: { id: params.id } });
      if (current) {
        const price = body.price !== undefined ? Number(body.price) || 0 : current.price;
        const deliveryPrice =
          body.deliveryPrice !== undefined
            ? Number(body.deliveryPrice) || 0
            : current.deliveryPrice;
        data.totalPrice = price + deliveryPrice;
      }
    }

    if (body.driverId !== undefined) data.driverId = body.driverId || null;

    if (body.status !== undefined) {
      if (!["PENDING", "DELIVERED", "CANCELLED"].includes(body.status)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      }
      data.status = body.status;
      data.deliveredAt =
        body.status === "DELIVERED" || body.status === "CANCELLED" ? new Date() : null;
    }

    const updated = await prisma.delivery.update({
      where: { id: params.id },
      data,
      include: { driver: { select: { id: true, name: true } } },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update delivery." }, { status: 500 });
  }
}

// DELETE /api/deliveries/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.delivery.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete delivery." }, { status: 500 });
  }
}
