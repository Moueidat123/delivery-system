import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/stats -> summary numbers for the dashboard
export async function GET() {
  const [total, pending, delivered, cancelled, agg, deliveredAgg] = await Promise.all([
    prisma.delivery.count(),
    prisma.delivery.count({ where: { status: "PENDING" } }),
    prisma.delivery.count({ where: { status: "DELIVERED" } }),
    prisma.delivery.count({ where: { status: "CANCELLED" } }),
    prisma.delivery.aggregate({
      _sum: { totalPrice: true, driverGain: true },
    }),
    prisma.delivery.aggregate({
      where: { status: "DELIVERED" },
      _sum: { totalPrice: true, driverGain: true, deliveryPrice: true },
    }),
  ]);

  return NextResponse.json({
    total,
    pending,
    delivered,
    cancelled,
    revenueAll: agg._sum.totalPrice || 0,
    driverGainAll: agg._sum.driverGain || 0,
    revenueDelivered: deliveredAgg._sum.totalPrice || 0,
    driverGainDelivered: deliveredAgg._sum.driverGain || 0,
    deliveryFeesDelivered: deliveredAgg._sum.deliveryPrice || 0,
  });
}
