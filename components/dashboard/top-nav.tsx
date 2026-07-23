"use client";

import Image from "next/image";
import { LogOut } from "lucide-react";
import { logoutUser } from "@/lib/firebase";
import type { User } from "firebase/auth";

export function TopNav({ user, rollNumber }: { user: User; rollNumber: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <span className="shrink-0 text-[14px] font-bold tracking-tight text-slate-800">
          Civil CR Election Portal
        </span>

        <div className="flex items-center gap-3.5">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName ?? "Student"}
              width={28}
              height={28}
              className="rounded-full border border-slate-200 shadow-2xs"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-[12px] font-semibold text-slate-600">
              {user.displayName?.[0] ?? "S"}
            </div>
          )}
          <span className="hidden text-[13px] font-semibold text-slate-500 sm:inline bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/40">
            {rollNumber}
          </span>
          <button
            type="button"
            onClick={logoutUser}
            aria-label="Sign out"
            className="text-slate-400 transition-colors hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
