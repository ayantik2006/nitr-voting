"use client";

import { useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatDate } from "@/lib/format";
import type { ElectionWithStats } from "@/lib/types";

export function MyElectionCard({
  election,
  onDelete,
}: {
  election: ElectionWithStats;
  onDelete: () => Promise<void>;
}) {
  const [showResults, setShowResults] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleDelete() {
    toast(`Delete "${election.title}"?`, {
      description: "This cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          setDeleting(true);
          try {
            await onDelete();
            toast.success("Election deleted");
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to delete");
          } finally {
            setDeleting(false);
          }
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  }

  return (
    <div className="flex flex-col rounded-xl border border-white/8 bg-neutral-900/40 p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-white/15">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[16px] font-semibold leading-snug text-neutral-100">
          {election.title}
        </h3>
        <StatusBadge status={election.status} />
      </div>
      <p className="mt-0.5 text-[13px] text-neutral-500">
        Created {formatDate(election.createdAt)}
      </p>

      <div className="mt-4 flex items-center gap-4 text-[13px] text-neutral-500">
        <span>
          <span className="text-neutral-300">{election.candidates.length}</span>{" "}
          candidates
        </span>
        <span>
          <span className="text-neutral-300">{election.votesCast}</span> votes
        </span>
      </div>

      {showResults && (
        <div className="mt-4 space-y-1.5 border-t border-white/8 pt-3">
          {election.candidates.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between text-[13px] text-neutral-400"
            >
              <span>{c.name}</span>
              <span className="text-neutral-300">
                {election.candidateVotes[c.id] ?? 0}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-4 border-t border-white/8 pt-3 text-[13px]">
        {election.status === "closed" ? (
          <button
            type="button"
            onClick={() => setShowResults((s) => !s)}
            className="text-neutral-400 transition-colors hover:text-neutral-200"
          >
            {showResults ? "Hide Results" : "Results"}
          </button>
        ) : (
          <span className="text-neutral-600">Results after voting closes</span>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-400/80 transition-colors hover:text-red-400 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
