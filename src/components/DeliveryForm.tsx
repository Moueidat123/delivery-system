"use client";

import { useEffect, useState } from "react";
import { DeliveryDTO, DriverDTO, generateSerial } from "@/lib/utils";

export interface DeliveryFormValues {
  serialNumber: string;
  productName: string;
  buyerName: string;
  buyerPhone: string;
  address: string;
  city: string;
  notes: string;
  price: string;
  deliveryPrice: string;
  totalPrice: string;
  driverGain: string;
  status: "PENDING" | "DELIVERED" | "CANCELLED";
  driverId: string;
}

function toForm(d?: DeliveryDTO | null): DeliveryFormValues {
  return {
    serialNumber: d?.serialNumber ?? generateSerial(),
    productName: d?.productName ?? "",
    buyerName: d?.buyerName ?? "",
    buyerPhone: d?.buyerPhone ?? "",
    address: d?.address ?? "",
    city: d?.city ?? "",
    notes: d?.notes ?? "",
    price: d ? String(d.price) : "",
    deliveryPrice: d ? String(d.deliveryPrice) : "",
    totalPrice: d ? String(d.totalPrice) : "",
    driverGain: d ? String(d.driverGain) : "",
    status: d?.status ?? "PENDING",
    driverId: d?.driverId ?? "",
  };
}

export default function DeliveryForm({
  open,
  onClose,
  onSaved,
  drivers,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  drivers: DriverDTO[];
  editing?: DeliveryDTO | null;
}) {
  const [form, setForm] = useState<DeliveryFormValues>(toForm(editing));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(toForm(editing));
      setError(null);
    }
  }, [open, editing]);

  // Auto-calculate total price = product price + delivery price
  useEffect(() => {
    const price = parseFloat(form.price) || 0;
    const deliveryPrice = parseFloat(form.deliveryPrice) || 0;
    setForm((f) => ({ ...f, totalPrice: String(price + deliveryPrice) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.price, form.deliveryPrice]);

  if (!open) return null;

  function update<K extends keyof DeliveryFormValues>(
    key: K,
    value: DeliveryFormValues[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        deliveryPrice: parseFloat(form.deliveryPrice) || 0,
        totalPrice: parseFloat(form.totalPrice) || 0,
        driverGain: parseFloat(form.driverGain) || 0,
        driverId: form.driverId || null,
      };

      const res = await fetch(
        editing ? `/api/deliveries/${editing.id}` : "/api/deliveries",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong.");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <h2 className="text-lg font-semibold">
            {editing ? "Edit Delivery" : "New Delivery"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {error && (
            <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
              {error}
            </div>
          )}

          {/* Product */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-slate-500">
              Product
            </legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Serial Number</label>
                <div className="flex gap-2">
                  <input
                    className="input"
                    value={form.serialNumber}
                    onChange={(e) => update("serialNumber", e.target.value)}
                    placeholder="DLV-XXXXXX"
                  />
                  <button
                    type="button"
                    className="btn-secondary shrink-0"
                    onClick={() => update("serialNumber", generateSerial())}
                    title="Generate a new serial"
                  >
                    ↻
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Product Name *</label>
                <input
                  className="input"
                  required
                  value={form.productName}
                  onChange={(e) => update("productName", e.target.value)}
                  placeholder="e.g. Wireless Headphones"
                />
              </div>
            </div>
          </fieldset>

          {/* Buyer */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-slate-500">Buyer</legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Buyer Name</label>
                <input
                  className="input"
                  value={form.buyerName}
                  onChange={(e) => update("buyerName", e.target.value)}
                  placeholder="Leave empty for Unknown"
                />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  className="input"
                  value={form.buyerPhone}
                  onChange={(e) => update("buyerPhone", e.target.value)}
                  placeholder="Leave empty for N/A"
                />
              </div>
              <div>
                <label className="label">City / Area</label>
                <input
                  className="input"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="e.g. Beirut"
                />
              </div>
              <div>
                <label className="label">Address</label>
                <input
                  className="input"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="Street, building..."
                />
              </div>
            </div>
          </fieldset>

          {/* Pricing */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-slate-500">
              Pricing
            </legend>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label className="label">Product Price</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="label">Delivery Price</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.deliveryPrice}
                  onChange={(e) => update("deliveryPrice", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="label">Total Price</label>
                <input
                  className="input bg-slate-50 font-semibold"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.totalPrice}
                  onChange={(e) => update("totalPrice", e.target.value)}
                  placeholder="auto"
                />
              </div>
              <div>
                <label className="label">Driver Gain</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.driverGain}
                  onChange={(e) => update("driverGain", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Total is auto-calculated (product + delivery). You can override it if
              needed.
            </p>
          </fieldset>

          {/* Assignment & status */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-slate-500">
              Assignment
            </legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Driver</label>
                <select
                  className="input"
                  value={form.driverId}
                  onChange={(e) => update("driverId", e.target.value)}
                >
                  <option value="">— Unassigned —</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select
                  className="input"
                  value={form.status}
                  onChange={(e) =>
                    update("status", e.target.value as DeliveryFormValues["status"])
                  }
                >
                  <option value="PENDING">Pending</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea
                className="input"
                rows={2}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Any extra details..."
              />
            </div>
          </fieldset>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : editing ? "Save Changes" : "Create Delivery"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
