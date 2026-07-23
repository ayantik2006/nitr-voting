"use client";

import { useEffect, useState } from "react";
import { Check, Clock, AlertTriangle, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { isRollNumberInRange } from "@/lib/roll-number";
import type { ElectionWithStats } from "@/lib/types";

function useCountdown(targetDate: string, onComplete?: () => void) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    let completed = false;
    
    function update() {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft("");
        if (!completed && onComplete) {
          completed = true;
          onComplete();
        }
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      
      const pad = (n: number) => String(n).padStart(2, "0");
      setTimeLeft(`${pad(h)}:${pad(m)}:${pad(s)}`);
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

const CandidateAvatar = ({ name, src }: { name: string; src?: string }) => {
  const [err, setErr] = useState(false);
  const initials = name.substring(0, 1).toUpperCase();
  
  const colorGradients: Record<string, string> = {
    A: "from-blue-400 to-indigo-500", 
    S: "from-emerald-400 to-teal-500", 
    T: "from-amber-400 to-orange-500", 
  };
  
  const gradient = colorGradients[initials] || "from-slate-400 to-slate-500";
  
  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErr(true)}
        className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
      />
    );
  }
  
  return (
    <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white text-[16px] sm:text-[18px] border-2 border-white shadow-xs shrink-0`}>
      {initials}
    </div>
  );
};

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
  const [showConfirm, setShowConfirm] = useState(false);
  const [triggerReload, setTriggerReload] = useState(false);

  const eligible = isRollNumberInRange(
    rollNumber,
    election.rollNumberFrom,
    election.rollNumberTo
  );

  const countdownOpen = useCountdown(election.startDate);
  const countdownClose = useCountdown(election.endDate);

  const resultsDate = new Date(new Date(election.endDate).getTime() + 10 * 60 * 1000).toISOString();
  const countdownResults = useCountdown(resultsDate, () => {
    setTriggerReload(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  });

  const resultsDeclared = new Date().getTime() >= new Date(resultsDate).getTime();

  const selectedCandidate = election.candidates.find((c) => c.id === candidateId);

  async function submitVote() {
    if (!candidateId) return;
    setVoting(true);
    try {
      await onVote(candidateId);
      setSelecting(false);
      setShowConfirm(false);
      toast.success("Vote successfully cast");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Vote submission failed");
    } finally {
      setVoting(false);
    }
  }

  const winnerId = (() => {
    if (election.status !== "closed" || Object.keys(election.candidateVotes).length === 0) return null;
    let max = -1;
    let winId = null;
    for (const [id, count] of Object.entries(election.candidateVotes)) {
      if (count > max) {
        max = count;
        winId = id;
      }
    }
    return winId;
  })();

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 transition-all duration-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2.5">
          <div>
            <h3 className="text-[16px] sm:text-[17px] font-bold leading-snug text-slate-900">
              {election.title}
            </h3>
            <p className="mt-0.5 text-[12px] sm:text-[13px] font-medium text-slate-500">{election.position}</p>
          </div>
          <StatusBadge status={election.status} />
        </div>

        {/* Timing and metadata */}
        <div className="mt-4 sm:mt-5 space-y-2 rounded-xl bg-slate-100/50 p-3 sm:p-4 border border-slate-200/40 text-[12.5px] sm:text-[13px]">
          {election.status === "upcoming" && (
            <div className="flex items-center gap-2 text-amber-600 font-bold">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Voting opens in {countdownOpen || "any moment"}</span>
            </div>
          )}
          {election.status === "open" && (
            <div className="flex items-center gap-2 text-indigo-600 font-bold">
              <Clock className="h-4 w-4 shrink-0 animate-pulse" />
              <span>Voting closes in {countdownClose || "any moment"}</span>
            </div>
          )}
          {election.status === "closed" && (
            <div className="flex items-center gap-2 text-slate-500 font-bold">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Voting has closed</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 text-slate-600 border-t border-slate-200/50">
            <span>Eligible voters</span>
            <span className="font-bold text-slate-800">{election.eligibleVoters} students</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Votes cast</span>
            <span className="font-bold text-slate-800 font-medium">
              {election.status === "closed" && resultsDeclared ? `${election.votesCast} votes` : "Hidden until declared"}
            </span>
          </div>
        </div>

        {/* Main Content (Nominees list or voting action) */}
        {election.status === "closed" ? (
          !resultsDeclared ? (
            <div className="mt-5 border-t border-slate-200/60 pt-5">
              <div className="flex flex-col items-center justify-center p-5 bg-slate-50 border border-slate-200/50 rounded-2xl text-center shadow-3xs">
                <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 animate-spin duration-3000">
                  <Clock className="h-5 w-5" />
                </div>
                <h4 className="mt-3 text-[14px] font-extrabold text-slate-800">Ballot Boxes Sealed</h4>
                <p className="mt-1 text-[12px] sm:text-[13px] text-slate-500 font-medium leading-relaxed">
                  Voting concluded at 6:00 PM. Results will be declared at 6:10 PM in:
                </p>
                <div className="mt-3.5 text-[24px] font-extrabold tracking-tight text-indigo-600 bg-indigo-50 px-4 py-1 rounded-xl border border-indigo-100/50 font-mono shadow-3xs">
                  {countdownResults || "Declaring..."}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 border-t border-slate-200/60 pt-5 animate-in fade-in duration-300">
              <h4 className="text-[12px] sm:text-[13px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                Official Election Results
              </h4>
              <div className="space-y-2.5">
                {election.candidates.map((c) => {
                  const votes = election.candidateVotes[c.id] ?? 0;
                  const pct = election.votesCast > 0 ? Math.round((votes / election.votesCast) * 100) : 0;
                  const isWinner = c.id === winnerId;
                  
                  return (
                    <div key={c.id} className={`rounded-xl border p-3 flex items-center justify-between transition-all ${
                      isWinner ? "border-emerald-200 bg-emerald-50/50 shadow-3xs" : "border-slate-200 bg-white"
                    }`}>
                      <div className="flex items-center gap-3">
                        <CandidateAvatar name={c.name} src={c.avatar} />
                        <div>
                          <p className="text-[13px] sm:text-[14px] font-bold text-slate-900 flex items-center gap-1.5">
                            {c.name}
                            {isWinner && (
                              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                Elected
                              </span>
                            )}
                          </p>
                          <p className="text-[11.5px] sm:text-[12px] text-slate-400 font-bold">{votes} votes ({pct}%)</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ) : election.hasVoted ? (
          <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 py-3 text-[14px] font-bold text-emerald-700 shadow-3xs">
            <Check className="h-4 w-4 text-emerald-600" />
            Ballot Submitted Successfully
          </div>
        ) : !eligible ? (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[12.5px] sm:text-[13px] font-semibold text-amber-800">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <span>Roll range restricted. You are not eligible to vote in this election.</span>
          </div>
        ) : selecting ? (
          <div className="mt-5 border-t border-slate-200/60 pt-5">
            <h4 className="text-[12px] sm:text-[13px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">
              Select Your Nominee
            </h4>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {election.candidates.map((c) => {
                const isSelected = candidateId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCandidateId(c.id)}
                    className={`flex flex-col items-center p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/60 scale-102 shadow-xs font-bold"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <CandidateAvatar name={c.name} src={c.avatar} />
                    <span className="mt-3 text-[13px] sm:text-[14px] font-bold text-slate-800">{c.name}</span>
                    <div className={`mt-2.5 h-4.5 w-4.5 sm:h-5 sm:w-5 rounded-full border flex items-center justify-center ${
                      isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white"
                    }`}>
                      {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2.5 pt-4">
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={!candidateId}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-[13.5px] sm:text-[14px] font-bold text-white shadow-md hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-50"
              >
                Cast Vote
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelecting(false);
                  setCandidateId(null);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13.5px] sm:text-[14px] font-semibold text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {election.status === "upcoming" && (
              <div className="mt-5 border-t border-slate-200/60 pt-5">
                <h4 className="text-[12px] sm:text-[13px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                  Nominees Preview
                </h4>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {election.candidates.map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-col items-center p-3 sm:p-4 rounded-xl border border-slate-200/60 bg-slate-50/50 opacity-85"
                    >
                      <CandidateAvatar name={c.name} src={c.avatar} />
                      <span className="mt-3 text-[13px] sm:text-[14px] font-bold text-slate-600">{c.name}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-center text-[12px] font-bold text-amber-700 bg-amber-50 py-2 rounded-xl border border-amber-100/50 uppercase tracking-wider select-none">
                  Voting is not open yet
                </p>
              </div>
            )}
            {election.status === "open" && (
              <button
                type="button"
                onClick={() => setSelecting(true)}
                className="mt-5 w-full rounded-xl bg-indigo-600 py-3 text-[13.5px] sm:text-[14px] font-bold text-white shadow-md hover:bg-indigo-700 active:scale-98 transition-all"
              >
                Vote Now
              </button>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && selectedCandidate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs px-4">
          <div className="w-full max-w-[340px] sm:max-w-[380px] rounded-2xl bg-white border border-slate-100 p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 mx-auto">
              <UserCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-center text-[16px] sm:text-[17px] font-bold text-slate-900">
              Confirm Your Ballot Selection
            </h3>
            <p className="mt-2 text-center text-[13px] sm:text-[13.5px] leading-relaxed text-slate-500">
              Are you sure you want to vote for <strong className="text-slate-800">{selectedCandidate.name}</strong> for <span className="font-bold text-indigo-600">{election.title}</span>? 
            </p>
            <div className="mt-4 bg-slate-50 rounded-xl p-3 sm:p-3.5 border border-slate-200/50 flex items-center justify-center gap-3">
              <CandidateAvatar name={selectedCandidate.name} src={selectedCandidate.avatar} />
              <div className="text-left">
                <p className="text-[13.5px] sm:text-[14px] font-bold text-slate-800">{selectedCandidate.name}</p>
                <p className="text-[11.5px] sm:text-[12px] text-slate-400 font-bold">Nominee</p>
              </div>
            </div>
            <div className="mt-3 text-center text-[11.5px] font-bold text-red-500 bg-red-50 py-1.5 rounded-lg border border-red-100/50">
              This action is permanent and cannot be undone.
            </div>
            
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={submitVote}
                disabled={voting}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-[13.5px] sm:text-[14px] font-bold text-white shadow-md hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-50"
              >
                {voting ? "Submitting..." : "Yes, Confirm Vote"}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={voting}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13.5px] sm:text-[14px] font-bold text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
