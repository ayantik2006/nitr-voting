"use client";

import { useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ElectionDetailsDialog } from "@/components/dashboard/election-details-dialog";
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
  const [showDetails, setShowDetails] = useState(false);
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
    <>
    <div className="glass-card rounded-2xl p-5 hover:border-slate-300 transition-all duration-150 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[16px] font-bold leading-snug text-slate-900">
            {election.title}
          </h3>
          <StatusBadge status={election.status} />
        </div>
        <p className="mt-1 text-[12px] font-medium text-slate-400">
          Created {formatDate(election.createdAt)}
        </p>

        {election.description && (
          <p className="mt-3 text-[13px] whitespace-pre-wrap text-slate-600">
            {election.description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-4 text-[13px] font-medium text-slate-500 bg-slate-50 border border-slate-200/50 p-2.5 rounded-xl">
          <span>
            Candidates: <span className="font-bold text-slate-800">{election.candidates.length}</span>
          </span>
          <span className="h-3 w-px bg-slate-200" />
          <span>
            Votes: <span className="font-bold text-slate-800">{election.votesCast}</span>
          </span>
        </div>

        {showResults && (
          <div className="mt-4 space-y-2 border-t border-slate-200/60 pt-3">
            {election.candidates.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between text-[13px] text-slate-600 bg-white border border-slate-100 p-2 rounded-lg"
              >
                <span className="font-semibold">{c.name}</span>
                <span className="font-bold text-slate-800">
                  {election.candidateVotes[c.id] ?? 0} votes
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-4 border-t border-slate-200/60 pt-3 text-[13px]">
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className="text-slate-500 font-bold transition-colors hover:text-slate-800"
        >
          Details
        </button>
        {election.status === "closed" ? (
          <button
            type="button"
            onClick={() => setShowResults((s) => !s)}
            className="text-indigo-600 font-bold transition-colors hover:text-indigo-800"
          >
            {showResults ? "Hide Results" : "Show Results"}
          </button>
        ) : (
          <span className="text-slate-400 font-semibold">Results after closing</span>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="ml-auto text-red-600 font-bold transition-colors hover:text-red-800 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
    {showDetails && (
      <ElectionDetailsDialog election={election} onClose={() => setShowDetails(false)} />
    )}
    </>
  );
}
