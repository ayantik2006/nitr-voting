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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
      <div className="scrollbar-thin max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-neutral-950 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-neutral-50">
            Create Election
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-[13px] text-neutral-400">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-[14px] text-neutral-100 outline-none focus:border-white/25"
              placeholder="Class Representative — CSE 3rd Year"
            />
          </div>

          <div>
            <label className="text-[13px] text-neutral-400">Position</label>
            <input
              required
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-[14px] text-neutral-100 outline-none focus:border-white/25"
              placeholder="Class Representative"
            />
          </div>

          <div>
            <label className="text-[13px] text-neutral-400">
              Description{" "}
              <span className="text-neutral-600">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1.5 w-full resize-none rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-[14px] text-neutral-100 outline-none focus:border-white/25"
              placeholder="Election body, eligibility rules, or other details voters should know"
            />
          </div>

          <div>
            <label className="text-[13px] text-neutral-400">Candidates</label>
            <div className="mt-1.5 space-y-2">
              {candidates.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={c}
                    onChange={(e) => updateCandidate(i, e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-[14px] text-neutral-100 outline-none focus:border-white/25"
                    placeholder={`Candidate ${i + 1}`}
                  />
                  {candidates.length > 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        setCandidates((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="shrink-0 text-neutral-500 hover:text-red-400"
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
              className="mt-2 flex items-center gap-1 text-[13px] text-neutral-400 hover:text-neutral-200"
            >
              <Plus className="h-3.5 w-3.5" />
              Add candidate
            </button>
          </div>

          <div>
            <label className="text-[13px] text-neutral-400">Eligible voters</label>
            <input
              type="number"
              min={0}
              value={eligibleVoters}
              onChange={(e) => setEligibleVoters(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-[14px] text-neutral-100 outline-none focus:border-white/25"
              placeholder="128"
            />
          </div>

          <div>
            <label className="text-[13px] text-neutral-400">
              Allowed roll numbers{" "}
              <span className="text-neutral-600">(optional)</span>
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-3">
              <input
                value={rollNumberFrom}
                onChange={(e) => setRollNumberFrom(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-[14px] text-neutral-100 outline-none focus:border-white/25"
                placeholder="125CE0001"
              />
              <input
                value={rollNumberTo}
                onChange={(e) => setRollNumberTo(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-[14px] text-neutral-100 outline-none focus:border-white/25"
                placeholder="125CE0075"
              />
            </div>
            <p className="mt-1.5 text-[12px] text-neutral-600">
              Leave blank to allow every eligible student to vote.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] text-neutral-400">Opens</label>
              <input
                required
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-[14px] text-neutral-100 outline-none focus:border-white/25"
              />
            </div>
            <div>
              <label className="text-[13px] text-neutral-400">Closes</label>
              <input
                required
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-[14px] text-neutral-100 outline-none focus:border-white/25"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-white py-2.5 text-[14px] font-medium text-black transition-transform duration-150 ease-out hover:-translate-y-px disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create Election"}
          </button>
        </form>
      </div>
    </div>
  );
}
