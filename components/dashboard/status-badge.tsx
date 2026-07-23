import { cn } from "@/lib/utils";
import type { ElectionStatus } from "@/lib/types";

const statusConfig: Record<ElectionStatus, { label: string; className: string }> = {
  open: {
    label: "Open",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-2xs",
  },
  upcoming: {
    label: "Upcoming",
    className: "border-amber-200 bg-amber-50 text-amber-700 shadow-2xs",
  },
  closed: {
    label: "Closed",
    className: "border-red-200 bg-red-50 text-red-700 shadow-2xs",
  },
};

export function StatusBadge({ status }: { status: ElectionStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
