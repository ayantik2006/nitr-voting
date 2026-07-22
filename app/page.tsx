"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { signInWithPopup, signOut } from "firebase/auth";
import { toast } from "sonner";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/lib/use-auth";
import { GoogleIcon } from "@/components/icons/google-icon";

const fade = {
  hidden: { opacity: 0 },
  show: (delay: number) => ({
    opacity: 1,
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

  async function handleSignIn() {
    setSigningIn(true);
    try {
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
    return <div className="min-h-screen bg-[#090909]" />;
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#090909]">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(255,255,255,0.035), transparent 65%)",
        }}
      />
      <div className="bg-noise pointer-events-none fixed inset-0 mix-blend-overlay" />

      {/* Header */}
      <header className="relative z-10 shrink-0 border-b border-white/8">
        <div className="mx-auto flex h-16 max-w-285 items-center justify-between px-6">
          <span className="text-[14px] font-medium text-neutral-200">
            NIT Rourkela
          </span>
          <span className="text-[14px] text-neutral-500">
            Student Election Portal
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 mx-auto flex w-full max-w-285 flex-1 flex-col px-6 md:flex-row">
        {/* Left column */}
        <motion.div
          variants={fade}
          initial="hidden"
          animate="show"
          custom={0}
          className="flex flex-col justify-center py-12 md:flex-1 md:py-16 md:pr-14"
        >
          <Image
            src="/nitr-logo.png"
            alt="NIT Rourkela"
            width={44}
            height={44}
            priority
            className="mix-blend-screen"
          />

          <h1 className="mt-8 text-[34px] font-semibold leading-tight tracking-tight text-neutral-50">
            Student Election Portal
          </h1>

          <p className="mt-4 max-w-md text-[16px] leading-relaxed text-neutral-400">
            Conducting secure, transparent and verifiable student elections
            for the NIT Rourkela community.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-md border border-white/10 bg-white/3 px-3 py-1.5 text-[13px] font-medium text-neutral-400"
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
          custom={0.1}
          className="flex flex-col justify-center border-t border-white/8 py-12 md:flex-1 md:py-16 md:border-t-0 md:border-l md:pl-14"
        >
          <p className="text-[14px] font-medium text-neutral-300">Sign in</p>

          <button
            type="button"
            onClick={handleSignIn}
            disabled={signingIn}
            className="mt-4 flex h-12 w-full max-w-105 items-center justify-center gap-3 rounded-xl bg-white text-[15px] font-medium text-black transition-transform duration-150 ease-out hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090909] disabled:opacity-60"
          >
            <GoogleIcon />
            {signingIn ? "Signing in…" : "Continue with Google"}
          </button>

          <p className="mt-4 text-[13px] text-neutral-500">
            Only official @nitrkl.ac.in accounts can sign in.
          </p>
        </motion.div>
      </main>

      <footer className="relative z-10 shrink-0 border-t border-white/8 px-6 py-4 text-center text-[12px] text-neutral-600">
        Built by Ayantik Sarkar
      </footer>
    </div>
  );
}
