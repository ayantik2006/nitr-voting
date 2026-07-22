import { cn } from "@/lib/utils";
import type { ElectionStatus } from "@/lib/types";

const statusConfig: Record<ElectionStatus, { label: string; className: string }> = {
  open: {
    label: "Open",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  },
  upcoming: {
    label: "Upcoming",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  },
  closed: {
    label: "Closed",
    className: "border-red-500/20 bg-red-500/10 text-red-400",
  },
};

export function StatusBadge({ status }: { status: ElectionStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[12px] font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
