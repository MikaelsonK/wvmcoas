"use client";

import React, { useState } from "react";
import { TopHeader } from "./TopHeader";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
  children: React.ReactNode;
}

export function DashboardLayout({ user, children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopHeader user={user} onMenuClick={() => setIsSidebarOpen(true)} />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Backdrop for mobile drawer */}
        <div
          className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-200 ${
            isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 md:relative md:z-auto flex h-full transition-transform duration-200 ease-in-out md:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <Sidebar role={user.role ?? ""} onClose={() => setIsSidebarOpen(false)} />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 min-w-0 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
