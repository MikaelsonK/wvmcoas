"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ClipboardList, 
  TrendingUp, 
  Users, 
  UserCheck, 
  Activity, 
  Award, 
  FileText, 
  FileSpreadsheet, 
  Network, 
  Settings 
} from "lucide-react";

interface SidebarProps {
  role: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const isLinkActive = (path: string) => {
    return pathname === path;
  };

  const linkStyle = (path: string) => ({
    display: "block",
    padding: "10px 16px",
    textDecoration: "none",
    color: isLinkActive(path) ? "white" : "#9ca3af",
    backgroundColor: isLinkActive(path) ? "var(--brand-red)" : "transparent",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: "500",
    transition: "all 0.2s ease",
  });

  return (
    <aside
      style={{
        width: 260,
        backgroundColor: "#111827",
        color: "#f3f4f6",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        overflowY: "auto",
        borderRight: "1px solid #1f2937",
      }}
    >
      {/* FEATURES Section */}
      <div>
        <h5 style={{ margin: "0 0 12px 16px", fontSize: 11, color: "#4b5563", letterSpacing: "1.5px", textTransform: "uppercase" }}>
          Features
        </h5>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Admin Links */}
          {role === "ADMIN" ? (
            <>
              <Link href="/admin" style={linkStyle("/admin")}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <LayoutDashboard size={16} /> Dashboard
                </span>
              </Link>
              <Link href="/admin/periods" style={linkStyle("/admin/periods")}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <ClipboardList size={16} /> Grading Sheet
                </span>
              </Link>
              <Link href="/admin/procedure-summary" style={linkStyle("/admin/procedure-summary")}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <TrendingUp size={16} /> Procedure Summary
                </span>
              </Link>
              <Link href="/admin/residents" style={linkStyle("/admin/residents")}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <Users size={16} /> Residents (Doctors)
                </span>
              </Link>
              <Link href="/admin/evaluators" style={linkStyle("/admin/evaluators")}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <UserCheck size={16} /> Evaluators (Doctors)
                </span>
              </Link>
              <Link href="/admin/patients" style={linkStyle("/admin/patients")}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <Activity size={16} /> Patients
                </span>
              </Link>
            </>
          ) : null}

          {/* Evaluator Links */}
          {role === "EVALUATOR" ? (
            <>
              <Link href="/evaluator" style={linkStyle("/evaluator")}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <LayoutDashboard size={16} /> Dashboard
                </span>
              </Link>
              <Link href="/evaluator/new" style={linkStyle("/evaluator/new")}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <FileText size={16} /> Submit Evaluation
                </span>
              </Link>
            </>
          ) : null}

          {/* Resident Links */}
          {role === "RESIDENT" ? (
            <>
              <Link href="/resident" style={linkStyle("/resident")}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <LayoutDashboard size={16} /> Dashboard
                </span>
              </Link>
              <Link href="/resident/ratings" style={linkStyle("/resident/ratings")}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <Award size={16} /> Ratings
                </span>
              </Link>
              <Link href="/resident/procedures" style={linkStyle("/resident/procedures")}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <Activity size={16} /> Procedure Count
                </span>
              </Link>
            </>
          ) : null}
        </div>
      </div>

      {/* SYSTEM Section (Admin Only) */}
      {role === "ADMIN" ? (
        <div>
          <h5 style={{ margin: "0 0 12px 16px", fontSize: 11, color: "#4b5563", letterSpacing: "1.5px", textTransform: "uppercase" }}>
            System
          </h5>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Link href="/admin/forms" style={linkStyle("/admin/forms")}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <FileSpreadsheet size={16} /> Forms config
              </span>
            </Link>
            <Link href="/admin/domains" style={linkStyle("/admin/domains")}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <Network size={16} /> Domains config
              </span>
            </Link>
            <Link href="/admin/procedures" style={linkStyle("/admin/procedures")}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <Settings size={16} /> Procedures config
              </span>
            </Link>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
