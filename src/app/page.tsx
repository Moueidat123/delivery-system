"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DeliveryDTO,
  DriverDTO,
  formatDate,
  formatMoney,
  type DeliveryStatus,
} from "@/lib/utils";
import StatCards, { Stats } from "@/components/StatCards";
import StatusBadge from "@/components/StatusBadge";
import DeliveryForm from "@/components/DeliveryForm";
import DriversManager from "@/components/DriversManager";

type Filter = "ALL" | DeliveryStatus;

export default function HomePage() {
  const [deliveries, setDeliveries] = useState<DeliveryDTO[]>([]);
  const [drivers, setDrivers] = useState<DriverDTO[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<Filter>("ALL");
  const [driverFilter, setDriverFilter] = useState("");
  const [query, setQuery] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DeliveryDTO | null>(null);
  const [driversOpen, setDriversOpen] = useState(false);

  const loadDeliveries = useCallback(async () => {
    const params = new URLSearchParams();
    if (filter !== "ALL") params.set("status", filter);
    if (driverFilter) params.set("driverId", driverFilter);
    if (query.trim()) params.set("q", query.trim());
    const res = await fetch(`/api/deliveries?${params.toString()}`);
    const data = await res.json();
    setDeliveries(data);
  }, [filter, driverFilter, query]);

  const loadDrivers = useCallback(async () => {
    const res = await fetch("/api/drivers");
    setDrivers(await res.json());
  }, []);

  const loadStats = useCallback(async () => {
    const res = await fetch("/api/stats");
    setStats(await res.json());
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadDeliveries(), loadDrivers(), loadStats()]);
  }, [loadDeliveries, loadDrivers, loadStats]);

  useEffect(() => {
    setLoading(true);
    refreshAll().finally(() => setLoading(false));
  }, [refreshAll]);

  // Debounced reload when filters/search change
  useEffect(() => {
    const t = setTimeout(() => {
      loadDeliveries();
    }, 250);
    return () => clearTimeout(t);
  }, [loadDeliveries]);

  async function setStatus(id: string, status: DeliveryStatus) {
    await fetch(`/api/deliveries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await Promise.all([loadDeliveries(), loadStats()]);
  }

  async function remove(id: string) {
    if (!confirm("Delete this delivery permanently?")) return;
    await fetch(`/api/deliveries/${id}`, { method: "DELETE" });
    await Promise.all([loadDeliveries(), loadStats()]);
  }

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(d: DeliveryDTO) {
    setEditing(d);
    setFormOpen(true);
  }

  const filterTabs: { key: Filter; label: string }[] = useMemo(
    () => [
      { key: "ALL", label: "All" },
      { key: "PENDING", label: "Pending" },
      { key: "DELIVERED", label: "Delivered" },
      { key: "CANCELLED", label: "Cancelled" },
    ],
    []
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-2xl">
            🚚
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Delivery System
            </h1>
            <p className="text-sm text-slate-500">
              Track products, buyers, drivers &amp; earnings.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setDriversOpen(true)}>
            🛵 Team
          </button>
          <button className="btn-primary" onClick={openNew}>
            + New Delivery
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="mb-6">
        <StatCards stats={stats} />
      </section>

      {/* Toolbar */}
      <section className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === t.key
                  ? "bg-brand-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            className="input sm:w-48"
            value={driverFilter}
            onChange={(e) => setDriverFilter(e.target.value)}
          >
            <option value="">All drivers</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <input
            className="input sm:w-64"
            placeholder="🔍 Search product, buyer, serial..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Deliveries */}
      <section>
        {loading ? (
          <div className="card animate-pulse text-center text-slate-400">
            Loading deliveries...
          </div>
        ) : deliveries.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 py-12 text-center">
            <div className="text-4xl">📭</div>
            <p className="font-medium text-slate-700">No deliveries found</p>
            <p className="text-sm text-slate-400">
              Create your first delivery to get started.
            </p>
            <button className="btn-primary mt-2" onClick={openNew}>
              + New Delivery
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 lg:block">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Serial / Product</th>
                    <th className="px-4 py-3">Buyer</th>
                    <th className="px-4 py-3">Driver</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">Driver Gain</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deliveries.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs text-slate-400">
                          {d.serialNumber}
                        </div>
                        <div className="font-medium text-slate-800">
                          {d.productName}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{d.buyerName}</div>
                        <a
                          href={`tel:${d.buyerPhone}`}
                          className="text-xs text-brand-600 hover:underline"
                        >
                          {d.buyerPhone}
                        </a>
                        {d.city && (
                          <div className="text-xs text-slate-400">{d.city}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {d.driver?.name ?? (
                          <span className="text-slate-300">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatMoney(d.totalPrice)}
                        <div className="text-xs font-normal text-slate-400">
                          {formatMoney(d.price)} + {formatMoney(d.deliveryPrice)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-700">
                        {formatMoney(d.driverGain)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {d.status !== "DELIVERED" && (
                            <button
                              title="Mark delivered"
                              onClick={() => setStatus(d.id, "DELIVERED")}
                              className="rounded-lg px-2 py-1 text-emerald-600 hover:bg-emerald-50"
                            >
                              ✓
                            </button>
                          )}
                          {d.status !== "CANCELLED" && (
                            <button
                              title="Mark cancelled"
                              onClick={() => setStatus(d.id, "CANCELLED")}
                              className="rounded-lg px-2 py-1 text-rose-600 hover:bg-rose-50"
                            >
                              ✕
                            </button>
                          )}
                          <button
                            title="Edit"
                            onClick={() => openEdit(d)}
                            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
                          >
                            ✎
                          </button>
                          <button
                            title="Delete"
                            onClick={() => remove(d.id)}
                            className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 lg:hidden">
              {deliveries.map((d) => (
                <div key={d.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-slate-400">
                        {d.serialNumber}
                      </div>
                      <div className="font-semibold text-slate-800">
                        {d.productName}
                      </div>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">Buyer</p>
                      <p className="font-medium">{d.buyerName}</p>
                      <a
                        href={`tel:${d.buyerPhone}`}
                        className="text-xs text-brand-600"
                      >
                        {d.buyerPhone}
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Driver</p>
                      <p className="font-medium">
                        {d.driver?.name ?? "Unassigned"}
                      </p>
                      {d.city && (
                        <p className="text-xs text-slate-400">{d.city}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Total</p>
                      <p className="font-semibold">{formatMoney(d.totalPrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Driver Gain</p>
                      <p className="font-semibold text-emerald-700">
                        {formatMoney(d.driverGain)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                    {d.status !== "DELIVERED" && (
                      <button
                        onClick={() => setStatus(d.id, "DELIVERED")}
                        className="btn-success flex-1"
                      >
                        ✓ Delivered
                      </button>
                    )}
                    {d.status !== "CANCELLED" && (
                      <button
                        onClick={() => setStatus(d.id, "CANCELLED")}
                        className="btn-danger flex-1"
                      >
                        ✕ Cancel
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(d)}
                      className="btn-secondary flex-1"
                    >
                      ✎ Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-center text-xs text-slate-400">
        {deliveries.length} delivery(ies) shown · Last updated {formatDate(new Date())}
      </p>

      {/* Modals */}
      <DeliveryForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={refreshAll}
        drivers={drivers}
        editing={editing}
      />
      <DriversManager
        open={driversOpen}
        onClose={() => setDriversOpen(false)}
        drivers={drivers}
        onChanged={refreshAll}
      />
    </main>
  );
}
