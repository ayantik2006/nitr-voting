"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/lib/use-auth";
import { GoogleIcon } from "@/components/icons/google-icon";

const fade = {
  hidden: { opacity: 0, y: 10 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay, ease: "easeOut" as const },
  }),
};

const chips = ["Official Platform", "Google Workspace", "One Vote per Student"];
const ALLOWED_DOMAIN = "nitrkl.ac.in";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/home");
    }
  }, [loading, user, router]);

  async function handleGoogleSignIn() {
    setSigningIn(true);
    try {
      const { signInWithPopup, signOut } = await import("firebase/auth");
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email ?? "";
      if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
        await signOut(auth);
        toast.error(`Only official @${ALLOWED_DOMAIN} accounts can sign in.`);
        return;
      }
      router.replace("/home");
    } catch {
      toast.error("Sign-in failed. Please try again.");
    } finally {
      setSigningIn(false);
    }
  }

  if (loading || user) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Decorative Gradients */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(79, 70, 229, 0.08), transparent 70%)",
        }}
      />
      <div className="bg-grid pointer-events-none fixed inset-0" />
      <div className="bg-noise pointer-events-none fixed inset-0" />

      {/* Header */}
      <header className="relative z-10 shrink-0 border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-[14px] font-bold tracking-tight text-slate-800">
              Civil CR Election Portal
            </span>
          </div>
          <span className="text-[12px] sm:text-[13px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/50">
            Student Election Portal
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 sm:px-6 py-8 sm:py-12 md:flex-row md:items-center md:gap-12 lg:gap-20">
        {/* Left column */}
        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          custom={0}
          className="flex flex-col justify-center md:flex-1 md:pr-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200/60">
            <Image
              src="/nitr-logo.png"
              alt="NIT Rourkela"
              width={28}
              height={28}
              priority
              className="object-contain"
            />
          </div>

          <h1 className="mt-8 text-[32px] font-bold leading-tight tracking-tight text-slate-900 md:text-[44px]">
            Elect Your Class Representative
          </h1>

          <p className="mt-4 max-w-md text-[15px] sm:text-[16px] leading-relaxed text-slate-500">
            A secure, transparent, and user-friendly platform for NIT Rourkela students to vote and elect their representatives.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-[12px] sm:text-[13px] font-medium text-slate-600 shadow-2xs"
              >
                {chip}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right column */}
        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          custom={0.15}
          className="mt-8 md:mt-0 w-full md:max-w-[400px]"
        >
          <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-[19px] sm:text-[20px] font-bold tracking-tight text-slate-900">
              Sign In
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              Please authenticate with your official school account to cast your vote.
            </p>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-[15px] font-medium text-slate-700 shadow-xs hover:bg-slate-50 active:scale-98 transition-all disabled:opacity-60"
              >
                <GoogleIcon />
                {signingIn ? "Signing in…" : "Continue with Google"}
              </button>
              <p className="mt-4 text-center text-[12px] text-slate-400 font-medium">
                Only official @nitrkl.ac.in accounts are permitted.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 shrink-0 border-t border-slate-200/80 bg-white/50 px-6 py-5 text-center text-[12px] text-slate-400 font-semibold">
        <div>Made by Ayantik and Rishav</div>
        <div className="mt-1 text-[11px] text-slate-400 font-medium">For NIT Rourkela students</div>
      </footer>
    </div>
  );
}
