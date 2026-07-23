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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs px-6">
      <div className="scrollbar-thin max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-bold text-slate-900">
              {election.title}
            </h2>
            <p className="mt-0.5 text-[13px] font-medium text-slate-500">{election.position}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={election.status} />
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {election.description && (
          <p className="mt-4 whitespace-pre-wrap text-[13px] text-slate-600">
            {election.description}
          </p>
        )}

        <div className="mt-5 space-y-1.5 border-t border-slate-200 pt-4 text-[13px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Opens</span>
            <span className="font-semibold text-slate-800">{formatDeadline(election.startDate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Closes</span>
            <span className="font-semibold text-slate-800">{formatDeadline(election.endDate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Eligible voters</span>
            <span className="font-semibold text-slate-800">{election.eligibleVoters} students</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Votes cast</span>
            <span className="font-semibold text-slate-800">{election.status === "closed" ? `${election.votesCast} votes` : "Hidden until closed"}</span>
          </div>
          {election.rollNumberFrom && election.rollNumberTo && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Eligible roll numbers</span>
              <span className="font-semibold text-slate-800">
                {election.rollNumberFrom}–{election.rollNumberTo}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Created by</span>
            <span className="font-semibold text-slate-800">{election.createdByName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Created on</span>
            <span className="font-semibold text-slate-800">{formatDate(election.createdAt)}</span>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-200 pt-4">
          <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-2">Candidates</p>
          <div className="mt-2 space-y-2">
            {election.candidates.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] text-slate-700"
              >
                <span className="font-bold">{c.name}</span>
                {election.status === "closed" && (
                  <span className="font-semibold text-slate-500">
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
