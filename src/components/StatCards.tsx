"use client";

import { formatMoney } from "@/lib/utils";

export interface Stats {
  total: number;
  pending: number;
  delivered: number;
  cancelled: number;
  revenueAll: number;
  driverGainAll: number;
  revenueDelivered: number;
  driverGainDelivered: number;
  deliveryFeesDelivered: number;
}

function Card({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  icon: string;
}) {
  return (
    <div className="card flex items-center gap-4">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${accent}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {sub && <p className="truncate text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

export default function StatCards({ stats }: { stats: Stats | null }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card h-[92px] animate-pulse bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card
        label="Total Orders"
        value={stats.total}
        sub={`${stats.pending} pending`}
        accent="bg-brand-100 text-brand-700"
        icon="📦"
      />
      <Card
        label="Delivered"
        value={stats.delivered}
        sub={`${stats.cancelled} cancelled`}
        accent="bg-emerald-100 text-emerald-700"
        icon="✅"
      />
      <Card
        label="Revenue (delivered)"
        value={formatMoney(stats.revenueDelivered)}
        sub={`${formatMoney(stats.revenueAll)} all orders`}
        accent="bg-indigo-100 text-indigo-700"
        icon="💰"
      />
      <Card
        label="Drivers' Earnings"
        value={formatMoney(stats.driverGainDelivered)}
        sub="from delivered orders"
        accent="bg-amber-100 text-amber-700"
        icon="🛵"
      />
    </div>
  );
}
