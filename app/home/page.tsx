"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Inbox, FolderPlus, HelpCircle } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import { useDashboardData } from "@/lib/use-dashboard-data";
import { authedFetch } from "@/lib/api-client";
import { TopNav } from "@/components/dashboard/top-nav";
import { ElectionCard } from "@/components/dashboard/election-card";
import { MyElectionCard } from "@/components/dashboard/my-election-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CreateElectionDialog } from "@/components/dashboard/create-election-dialog";

const fade = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
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
    () => elections.filter((e) => e.status === "open" || e.status === "upcoming"),
    [elections]
  );
  
  const myElections = useMemo(
    () => (user ? elections.filter((e) => e.createdBy === user.uid) : []),
    [elections, user]
  );

  const stats = [
    { label: "Active Elections", value: ongoingElections.filter((e) => e.status === "open").length },
    { label: "Created Elections", value: myElections.length },
    {
      label: "Votes Cast by You",
      value: elections.filter((e) => e.hasVoted).length,
    },
    {
      label: "Completed Elections",
      value: elections.filter((e) => e.status === "closed").length,
    },
  ];

  if (authLoading || !user) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  const firstName = user.displayName?.split(" ")[0] ?? "Student";

  const profileChips = profile
    ? [
        { label: "Roll Number", value: profile.rollNumber },
        { label: "Email", value: profile.email },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Decorative Gradients */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(79, 70, 229, 0.04), transparent 70%)",
        }}
      />
      <div className="bg-grid pointer-events-none fixed inset-0" />
      <div className="bg-noise pointer-events-none fixed inset-0" />

      <TopNav user={user} rollNumber={profile?.rollNumber ?? ""} />

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <motion.div variants={fade} initial="hidden" animate="show">
          <span className="text-[12px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 uppercase tracking-wider">
            Student Dashboard
          </span>
          <h1 className="mt-4 text-[32px] font-extrabold tracking-tight text-slate-950">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1.5 text-[15px] font-medium text-slate-500">
            Civil Class Representative Elections Portal
          </p>

          {profileChips.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2.5">
              {profileChips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-slate-700 shadow-2xs"
                >
                  <span className="text-slate-400 font-semibold mr-1.5">{chip.label}: </span>
                  {chip.value}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {error && (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-[14px] font-medium text-red-700 shadow-2xs">
            {error}
          </p>
        )}

        {/* Voting Info Notification Box */}
        <motion.div 
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 shadow-2xs flex gap-3.5 items-start"
        >
          <HelpCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[14.5px] font-bold text-blue-900">Election Information</h3>
            <p className="mt-1 text-[13.5px] text-blue-700 leading-relaxed">
              We are electing <strong>two separate Class Representatives</strong> (1st Position and 2nd Position). You are eligible to cast <strong>one vote</strong> in each of the ongoing elections listed below. Voting is open from <strong>3:00 AM to 6:00 AM</strong>. Intermediate vote counts are strictly hidden until voting concludes.
            </p>
          </div>
        </motion.div>

        {/* Ongoing Elections */}
        <motion.section
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-12"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[20px] font-extrabold tracking-tight text-slate-900">
              Active & Upcoming CR Ballots
            </h2>
          </div>
          {loading ? (
            <SkeletonGrid />
          ) : ongoingElections.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-2">
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
              icon={<Inbox className="h-6 w-6 text-slate-400" />}
              title="No active or upcoming ballots."
            />
          )}
        </motion.section>

        {/* My Created Elections (Admin Panel / Creators) */}
        {profile?.role === "Admin" && (
          <motion.section
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-16 border-t border-slate-200 pt-12"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-[20px] font-extrabold tracking-tight text-slate-900">
                  Election Administration
                </h2>
                <p className="text-[13px] text-slate-500">Manage school ballots and monitor audit trails.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-98 transition-all"
              >
                Create New Election
              </button>
            </div>
            {loading ? (
              <SkeletonGrid />
            ) : myElections.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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
                icon={<FolderPlus className="h-6 w-6 text-slate-400" />}
                title="No custom elections created yet."
                action={
                  <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    className="mt-2 rounded-xl bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-98 transition-all"
                  >
                    Create Custom Election
                  </button>
                }
              />
            )}
          </motion.section>
        )}

        {/* Statistics Dashboard */}
        <motion.section
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-16 border-t border-slate-200 pt-12"
        >
          <h2 className="mb-5 text-[20px] font-extrabold tracking-tight text-slate-900">
            Participation Metrics
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-3xs"
              >
                <p className="text-[28px] font-extrabold text-slate-950 tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1 text-[13px] font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
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
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="h-44 animate-pulse rounded-2xl border border-slate-200/60 bg-white/60 shadow-3xs"
        />
      ))}
    </div>
  );
}
