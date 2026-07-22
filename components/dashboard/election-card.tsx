"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ElectionDetailsDialog } from "@/components/dashboard/election-details-dialog";
import { formatDeadline } from "@/lib/format";
import { isRollNumberInRange } from "@/lib/roll-number";
import type { ElectionWithStats } from "@/lib/types";

export function ElectionCard({
  election,
  rollNumber,
  onVote,
}: {
  election: ElectionWithStats;
  rollNumber: string;
  onVote: (candidateId: string) => Promise<void>;
}) {
  const [voting, setVoting] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const eligible = isRollNumberInRange(
    rollNumber,
    election.rollNumberFrom,
    election.rollNumberTo
  );

  async function submitVote() {
    if (!candidateId) return;
    setVoting(true);
    try {
      await onVote(candidateId);
      setSelecting(false);
      toast.success("Vote submitted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Vote failed");
    } finally {
      setVoting(false);
    }
  }

  return (
    <>
    <div className="flex flex-col rounded-xl border border-white/8 bg-neutral-900/40 p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-white/15">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-semibold leading-snug text-neutral-100">
            {election.title}
          </h3>
          <p className="mt-0.5 text-[13px] text-neutral-500">{election.position}</p>
        </div>
        <StatusBadge status={election.status} />
      </div>

      <div className="mt-4 space-y-1.5 text-[13px]">
        <div className="flex items-center justify-between">
          <span className="text-neutral-500">Deadline</span>
          <span className="text-neutral-300">{formatDeadline(election.endDate)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-neutral-500">Eligible voters</span>
          <span className="text-neutral-300">{election.eligibleVoters}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-neutral-500">Votes cast</span>
          <span className="text-neutral-300">{election.votesCast}</span>
        </div>
        {election.rollNumberFrom && election.rollNumberTo && (
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Eligible roll numbers</span>
            <span className="text-neutral-300">
              {election.rollNumberFrom}–{election.rollNumberTo}
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowDetails(true)}
        className="mt-3 self-start text-[13px] text-neutral-400 underline-offset-2 hover:text-neutral-200 hover:underline"
      >
        View Details
      </button>

      {election.status === "open" &&
        (election.hasVoted ? (
          <div className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 py-2 text-[13px] font-medium text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            Vote Submitted
          </div>
        ) : !eligible ? (
          <p className="mt-4 text-center text-[13px] text-neutral-500">
            You&apos;re not eligible to vote in this election.
          </p>
        ) : selecting ? (
          <div className="mt-4 space-y-2">
            {election.candidates.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2 rounded-lg border border-white/8 px-3 py-2 text-[13px] text-neutral-300 has-checked:border-white/25"
              >
                <input
                  type="radio"
                  name={`vote-${election._id}`}
                  className="accent-white"
                  checked={candidateId === c.id}
                  onChange={() => setCandidateId(c.id)}
                />
                {c.name}
              </label>
            ))}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={submitVote}
                disabled={!candidateId || voting}
                className="flex-1 rounded-lg bg-white py-2 text-[13px] font-medium text-black disabled:opacity-50"
              >
                {voting ? "Submitting…" : "Submit Vote"}
              </button>
              <button
                type="button"
                onClick={() => setSelecting(false)}
                className="rounded-lg border border-white/10 px-3 py-2 text-[13px] text-neutral-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSelecting(true)}
            className="mt-4 rounded-lg bg-white py-2 text-[13px] font-medium text-black transition-transform duration-150 ease-out hover:-translate-y-px"
          >
            Vote Now
          </button>
        ))}
    </div>
    {showDetails && (
      <ElectionDetailsDialog election={election} onClose={() => setShowDetails(false)} />
    )}
    </>
  );
}
