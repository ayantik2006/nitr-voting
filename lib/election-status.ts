import type { ElectionStatus } from "@/lib/types";

export function computeStatus(startDate: string, endDate: string): ElectionStatus {
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (now < start) return "upcoming";
  if (now > end) return "closed";
  return "open";
}
