"use client";

import { signOut } from "next-auth/react";
import { Button } from "react-aria-components";
import { LogOut } from "lucide-react";

interface TopHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

const roleLabel: Record<string, string> = {
  ADMIN:     "Administrator",
  EVALUATOR: "Evaluator",
  RESIDENT:  "Resident",
};

export function TopHeader({ user }: TopHeaderProps) {
  const initials = user.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="h-14 flex items-center justify-between px-5 bg-white border-b border-gray-200 shrink-0">

      {/* Left: title */}
      <span className="text-[13.5px] font-semibold text-gray-700 tracking-tight">
        Online Assessment System
      </span>

      {/* Right: user + logout */}
      <div className="flex items-center gap-3">

        {/* User info */}
        <div className="flex flex-col items-end leading-tight">
          <span className="text-[12.5px] font-semibold text-gray-800">{user.name || user.email || "User"}</span>
          <span className="text-[11px] text-brand-red font-medium">
            {roleLabel[user.role ?? ""] ?? user.role}
          </span>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red text-[12px] font-bold flex-shrink-0">
          {initials}
        </div>

        {/* Logout */}
        <Button
          onPress={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-500 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 hover:text-gray-700 transition-colors duration-150 outline-none cursor-pointer"
        >
          <LogOut size={13} />
          Logout
        </Button>
      </div>
    </header>
  );
}
