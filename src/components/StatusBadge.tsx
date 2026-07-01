import { STATUS_LABELS, STATUS_STYLES, type DeliveryStatus } from "@/lib/utils";

export default function StatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <span className={`badge ${STATUS_STYLES[status]}`}>
      <span className="mr-1 text-base leading-none">
        {status === "DELIVERED" ? "✓" : status === "CANCELLED" ? "✕" : "•"}
      </span>
      {STATUS_LABELS[status]}
    </span>
  );
}
