"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { authedFetch } from "@/lib/api-client";

export function CreateElectionDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [eligibleVoters, setEligibleVoters] = useState("");
  const [rollNumberFrom, setRollNumberFrom] = useState("");
  const [rollNumberTo, setRollNumberTo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [candidates, setCandidates] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);

  function updateCandidate(i: number, value: string) {
    setCandidates((prev) => prev.map((c, idx) => (idx === i ? value : c)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const candidateNames = candidates.map((c) => c.trim()).filter(Boolean);
    if (candidateNames.length < 2) {
      toast.error("Add at least two candidates.");
      return;
    }
    if (!startDate || !endDate || new Date(endDate) <= new Date(startDate)) {
      toast.error("End date must be after the start date.");
      return;
    }
    if (rollNumberFrom.trim() && !rollNumberTo.trim()) {
      toast.error("Add an ending roll number for the range.");
      return;
    }
    if (!rollNumberFrom.trim() && rollNumberTo.trim()) {
      toast.error("Add a starting roll number for the range.");
      return;
    }

    setSubmitting(true);
    try {
      await authedFetch("/api/elections", {
        method: "POST",
        body: JSON.stringify({
          title,
          position,
          description: description.trim(),
          candidateNames,
          eligibleVoters: Number(eligibleVoters) || 0,
          rollNumberFrom: rollNumberFrom.trim(),
          rollNumberTo: rollNumberTo.trim(),
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        }),
      });
      onCreated();
      onClose();
      toast.success("Election created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create election");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs px-6">
      <div className="scrollbar-thin max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-slate-900">
            Create Custom Election
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-[13px] font-semibold text-slate-600">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-[14px] text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
              placeholder="Class Representative — CSE 3rd Year"
            />
          </div>

          <div>
            <label className="text-[13px] font-semibold text-slate-600">Position</label>
            <input
              required
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-[14px] text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
              placeholder="Class Representative"
            />
          </div>

          <div>
            <label className="text-[13px] font-semibold text-slate-600">
              Description{" "}
              <span className="text-slate-400 font-medium">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-[14px] text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
              placeholder="Election guidelines, eligibility rules, etc."
            />
          </div>

          <div>
            <label className="text-[13px] font-semibold text-slate-600">Candidates</label>
            <div className="mt-1.5 space-y-2.5">
              {candidates.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={c}
                    onChange={(e) => updateCandidate(i, e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-[14px] text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
                    placeholder={`Candidate ${i + 1}`}
                  />
                  {candidates.length > 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        setCandidates((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="shrink-0 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCandidates((prev) => [...prev, ""])}
              className="mt-2.5 flex items-center gap-1.5 text-[13px] font-bold text-indigo-600 hover:text-indigo-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Add candidate
            </button>
          </div>

          <div>
            <label className="text-[13px] font-semibold text-slate-600">Eligible voters count</label>
            <input
              type="number"
              min={0}
              value={eligibleVoters}
              onChange={(e) => setEligibleVoters(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-[14px] text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
              placeholder="e.g. 75"
            />
          </div>

          <div>
            <label className="text-[13px] font-semibold text-slate-600">
              Allowed Roll Number Range{" "}
              <span className="text-slate-400 font-medium">(optional)</span>
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-3">
              <input
                value={rollNumberFrom}
                onChange={(e) => setRollNumberFrom(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-[14px] text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
                placeholder="125CE0001"
              />
              <input
                value={rollNumberTo}
                onChange={(e) => setRollNumberTo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-[14px] text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
                placeholder="125CE0075"
              />
            </div>
            <p className="mt-1.5 text-[12px] text-slate-400 font-medium">
              Leave blank to allow any student to vote.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-semibold text-slate-600">Opens</label>
              <input
                required
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-[14px] text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="text-[13px] font-semibold text-slate-600">Closes</label>
              <input
                required
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-[14px] text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-indigo-600 py-3 text-[14px] font-bold text-white shadow-md hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-50"
          >
            {submitting ? "Creating Election..." : "Create Election"}
          </button>
        </form>
      </div>
    </div>
  );
}
