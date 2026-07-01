"use client";

import { useState } from "react";
import { DriverDTO } from "@/lib/utils";

export default function DriversManager({
  open,
  onClose,
  drivers,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  drivers: DriverDTO[];
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function addDriver(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add driver.");
      }
      setName("");
      setPhone("");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add driver.");
    } finally {
      setSaving(false);
    }
  }

  async function removeDriver(id: string) {
    if (!confirm("Delete this driver? Their deliveries will become unassigned.")) return;
    const res = await fetch(`/api/drivers/${id}`, { method: "DELETE" });
    if (res.ok) onChanged();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <h2 className="text-lg font-semibold">Delivery Team</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 p-5">
          <form onSubmit={addDriver} className="space-y-3">
            {error && (
              <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Driver Name *</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter driver name"
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              {saving ? "Adding..." : "+ Add Driver"}
            </button>
          </form>

          <div className="divide-y divide-slate-100 rounded-xl ring-1 ring-slate-200">
            {drivers.length === 0 && (
              <p className="p-4 text-center text-sm text-slate-400">
                No drivers yet. Add your first team member above.
              </p>
            )}
            {drivers.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{d.name}</p>
                  <p className="truncate text-sm text-slate-500">
                    {d.phone || "No phone"} · {d._count?.deliveries ?? 0} deliveries
                  </p>
                </div>
                <button
                  onClick={() => removeDriver(d.id)}
                  className="shrink-0 rounded-lg px-2 py-1 text-sm text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
