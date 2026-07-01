// Shared helpers used across the app.

export type DeliveryStatus = "PENDING" | "DELIVERED" | "CANCELLED";

export const STATUS_LABELS: Record<DeliveryStatus, string> = {
  PENDING: "Pending",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const STATUS_STYLES: Record<DeliveryStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 ring-amber-600/20",
  DELIVERED: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  CANCELLED: "bg-rose-100 text-rose-800 ring-rose-600/20",
};

// Format a number as currency. Default currency can be changed here.
export function formatMoney(value: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  } catch {
    return `${(value ?? 0).toFixed(2)}`;
  }
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Generate a human-friendly serial number, e.g. DLV-8FK3Q2
export function generateSerial(prefix = "DLV"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${out}`;
}

// The shape of a delivery as returned by the API (dates serialized as strings).
export interface DeliveryDTO {
  id: string;
  serialNumber: string;
  productName: string;
  buyerName: string;
  buyerPhone: string;
  address: string | null;
  city: string | null;
  notes: string | null;
  price: number;
  deliveryPrice: number;
  totalPrice: number;
  driverGain: number;
  status: DeliveryStatus;
  driverId: string | null;
  driver: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  deliveredAt: string | null;
}

export interface DriverDTO {
  id: string;
  name: string;
  phone: string | null;
  active: boolean;
  createdAt: string;
  _count?: { deliveries: number };
}
