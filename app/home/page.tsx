"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Inbox, FolderPlus } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import { useDashboardData } from "@/lib/use-dashboard-data";
import { authedFetch } from "@/lib/api-client";
import { TopNav } from "@/components/dashboard/top-nav";
import { ElectionCard } from "@/components/dashboard/election-card";
import { MyElectionCard } from "@/components/dashboard/my-election-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CreateElectionDialog } from "@/components/dashboard/create-election-dialog";

const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, elections, loading, error, refetch } = useDashboardData(user);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  const ongoingElections = useMemo(
    () => elections.filter((e) => e.status === "open"),
    [elections]
  );
  const myElections = useMemo(
    () => (user ? elections.filter((e) => e.createdBy === user.uid) : []),
    [elections, user]
  );

  const stats = [
    { label: "Available Elections", value: ongoingElections.length },
    { label: "Created Elections", value: myElections.length },
    {
      label: "Votes Cast",
      value: elections.filter((e) => e.hasVoted).length,
    },
    {
      label: "Completed Elections",
      value: myElections.filter((e) => e.status === "closed").length,
    },
  ];

  if (authLoading || !user) {
    return <div className="min-h-screen bg-[#090909]" />;
  }

  const firstName = user.displayName?.split(" ")[0] ?? "Student";

  const profileChips = profile
    ? [
        { label: "Roll Number", value: profile.rollNumber },
        { label: "Email", value: profile.email },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#090909]">
      <TopNav user={user} rollNumber={profile?.rollNumber ?? ""} />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <motion.div variants={fade} initial="hidden" animate="show">
          <p className="text-[13px] text-neutral-500">Dashboard</p>
          <h1 className="mt-1 text-[30px] font-semibold tracking-tight text-neutral-50">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-[14px] text-neutral-500">
            Online Election Portal
          </p>

          {profileChips.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {profileChips.map((chip) => (
                <span
                  key={chip.label}
                  className="rounded-md border border-white/10 bg-white/3 px-3 py-1.5 text-[13px] text-neutral-400"
                >
                  <span className="text-neutral-600">{chip.label}: </span>
                  {chip.value}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {error && (
          <p className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
            {error}
          </p>
        )}

        {/* Ongoing Elections */}
        <motion.section
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-16"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-neutral-50">
              Ongoing Elections
            </h2>
          </div>
          {loading ? (
            <SkeletonGrid />
          ) : ongoingElections.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ongoingElections.map((election) => (
                <ElectionCard
                  key={election._id}
                  election={election}
                  rollNumber={profile?.rollNumber ?? ""}
                  onVote={async (candidateId) => {
                    await authedFetch(`/api/elections/${election._id}/vote`, {
                      method: "POST",
                      body: JSON.stringify({ candidateId }),
                    });
                    await refetch();
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Inbox className="h-6 w-6" />}
              title="No ongoing elections."
            />
          )}
        </motion.section>

        {/* My Elections */}
        <motion.section
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-16"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-neutral-50">
              My Elections
            </h2>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="rounded-lg bg-white px-3.5 py-2 text-[13px] font-medium text-black transition-transform duration-150 ease-out hover:-translate-y-px"
            >
              Create New Election
            </button>
          </div>
          {loading ? (
            <SkeletonGrid />
          ) : myElections.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myElections.map((election) => (
                <MyElectionCard
                  key={election._id}
                  election={election}
                  onDelete={async () => {
                    await authedFetch(`/api/elections/${election._id}`, {
                      method: "DELETE",
                    });
                    await refetch();
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FolderPlus className="h-6 w-6" />}
              title="No elections created yet."
              action={
                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className="mt-1 rounded-lg bg-white px-3.5 py-2 text-[13px] font-medium text-black"
                >
                  Create Election
                </button>
              }
            />
          )}
        </motion.section>

        {/* Statistics */}
        <motion.section
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-16"
        >
          <h2 className="mb-4 text-[20px] font-semibold text-neutral-50">
            Statistics
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/8 bg-neutral-900/40 p-4"
              >
                <p className="text-[24px] font-semibold text-neutral-50">
                  {stat.value}
                </p>
                <p className="mt-1 text-[13px] text-neutral-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </main>

      {showCreate && (
        <CreateElectionDialog
          onClose={() => setShowCreate(false)}
          onCreated={refetch}
        />
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-xl border border-white/8 bg-neutral-900/40"
        />
      ))}
    </div>
  );
}
