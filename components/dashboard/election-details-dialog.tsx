"use client";

import { X } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatDate, formatDeadline } from "@/lib/format";
import type { ElectionWithStats } from "@/lib/types";

export function ElectionDetailsDialog({
  election,
  onClose,
}: {
  election: ElectionWithStats;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
      <div className="scrollbar-thin max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-neutral-950 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-semibold text-neutral-50">
              {election.title}
            </h2>
            <p className="mt-0.5 text-[13px] text-neutral-500">{election.position}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={election.status} />
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {election.description && (
          <p className="mt-4 whitespace-pre-wrap text-[13px] text-neutral-400">
            {election.description}
          </p>
        )}

        <div className="mt-5 space-y-1.5 border-t border-white/8 pt-4 text-[13px]">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Opens</span>
            <span className="text-neutral-300">{formatDeadline(election.startDate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Closes</span>
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
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Created by</span>
            <span className="text-neutral-300">{election.createdByName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Created on</span>
            <span className="text-neutral-300">{formatDate(election.createdAt)}</span>
          </div>
        </div>

        <div className="mt-5 border-t border-white/8 pt-4">
          <p className="text-[13px] text-neutral-500">Candidates</p>
          <div className="mt-2 space-y-1.5">
            {election.candidates.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-white/8 px-3 py-2 text-[13px] text-neutral-300"
              >
                <span>{c.name}</span>
                {election.status === "closed" && (
                  <span className="text-neutral-500">
                    {election.candidateVotes[c.id] ?? 0} votes
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
