"use client";

import Image from "next/image";
import { LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { User } from "firebase/auth";

export function TopNav({ user, rollNumber }: { user: User; rollNumber: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#090909]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
        <span className="shrink-0 text-[14px] font-medium text-neutral-200">
          NIT Rourkela
        </span>

        <div className="flex items-center gap-3">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName ?? "Student"}
              width={28}
              height={28}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-[12px] font-medium text-neutral-300">
              {user.displayName?.[0] ?? "S"}
            </div>
          )}
          <span className="hidden text-[13px] text-neutral-400 sm:inline">
            {rollNumber}
          </span>
          <button
            type="button"
            onClick={() => signOut(auth)}
            aria-label="Sign out"
            className="text-neutral-500 transition-colors hover:text-neutral-200"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
