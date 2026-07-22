import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  action,
}: {
  icon: ReactNode;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 py-14 text-center">
      <div className="text-neutral-600">{icon}</div>
      <p className="text-[14px] text-neutral-500">{title}</p>
      {action}
    </div>
  );
}
