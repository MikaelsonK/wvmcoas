"use client";

import { signOut } from "next-auth/react";

interface TopHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export function TopHeader({ user }: TopHeaderProps) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        backgroundColor: "var(--bg-primary)",
        borderBottom: "3px solid var(--brand-gold)",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "var(--brand-red)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          O
        </div>
        <span style={{ fontSize: 18, fontWeight: "bold", color: "var(--text)" }}>
          Online Assessment System (OAS)
        </span>
      </div>

      {/* User Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontSize: 13 }}>
          <strong style={{ color: "var(--text)" }}>{user.name || "User"}</strong>
          <span style={{ color: "var(--brand-red)", fontWeight: "500", fontSize: 11 }}>
            {user.role}
          </span>
        </div>
        
        {/* Avatar badge */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "var(--muted)",
            fontSize: 14,
            fontWeight: "bold"
          }}
        >
          {user.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
        </div>

        <button
          className="button-secondary"
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{ padding: "6px 12px", fontSize: 12 }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
