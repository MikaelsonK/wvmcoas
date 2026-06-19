import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import React from "react";
import { PrintButton } from "@/components/PrintButton";
import { ProcedureLogForm } from "@/components/ProcedureLogForm";

export default async function ResidentProceduresPage() {
  const { userId } = await requireRole(["RESIDENT"]);

  // Fetch all procedure types and procedures
  const procedureTypes = await prisma.procedureType.findMany({
    include: {
      procedures: {
        orderBy: { name: "asc" }
      }
    },
    orderBy: { name: "asc" }
  });

  const procedures = await prisma.procedure.findMany({
    include: { type: true },
    orderBy: { name: "asc" },
  });

  // Fetch this resident's logs
  const logs = await prisma.procedureLog.findMany({
    where: { residentId: userId },
    include: {
      procedure: {
        include: { type: true },
      },
    },
    orderBy: { loggedAt: "desc" },
  });

  type LogRow = (typeof logs)[number];
  type ProcRow = (typeof procedures)[number];

  // Calculate completed count per procedure
  const logCounts = new Map<string, number>();
  for (const log of logs) {
    logCounts.set(log.procedureId, (logCounts.get(log.procedureId) ?? 0) + 1);
  }

  const targetProceduresCount = 15; // Target requirement per procedure
  const totalLogged = logs.length;
  
  // Total unique target count = total number of procedures * 15
  const totalProcedures = procedures.length;
  const overallTarget = totalProcedures * targetProceduresCount;
  const completionPercentage = overallTarget > 0 ? Math.min(Math.round((totalLogged / overallTarget) * 100), 100) : 0;

  const procedureOptions = procedures.map((p) => ({
    id: p.id,
    name: p.name,
    typeName: p.type.name,
  }));

  return (
    <div className="card">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-family: 'Poppins', sans-serif !important;
          }
          aside, header, nav, button, .button-primary, .button-secondary, .no-print, .log-form-col {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
          }
          .card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            background: transparent !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
            margin-top: 16px !important;
          }
          th, td {
            border: 1px solid #111 !important;
            padding: 8px !important;
            font-size: 11px !important;
            color: #000 !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
          .proc-type-hdr {
            background-color: #f2f2f2 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}} />

      <div className="row" style={{ alignItems: "center", marginBottom: 24 }}>
        <div className="col">
          <h1>Clinical Procedure Logger & Monitor</h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)" }}>
            Log completed operations and track your requirements progress.
          </p>
        </div>
        <div className="col text-center no-print" style={{ textAlign: "right", display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <PrintButton label="🖨️ Print Progress Report" className="button-primary" style={{ backgroundColor: "var(--brand-red)" }} />
          <Link href="/resident" className="button-secondary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Progress / Tracker Cards */}
      <div className="row" style={{ marginBottom: 24 }}>
        <div className="col card" style={{ padding: 20, backgroundColor: "var(--bg-secondary)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Rotations Requirements Completion Track</strong>
            <span style={{ color: "var(--brand-red)", fontWeight: "bold" }}>{totalLogged} / {overallTarget} Total Logs</span>
          </div>
          {/* Progress Bar */}
          <div style={{ width: "100%", height: 16, backgroundColor: "var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ width: `${completionPercentage}%`, height: "100%", backgroundColor: "var(--brand-red)", transition: "width 0.4s ease" }} />
          </div>
          <small style={{ color: "var(--muted)" }}>You have completed {completionPercentage}% of your total procedure targets.</small>
        </div>
      </div>

      <div className="row" style={{ gap: 20 }}>
        {/* Logging Form Card Column (hidden when printing) */}
        <div className="col log-form-col" style={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3>Log Completed Procedure</h3>
            <ProcedureLogForm procedures={procedureOptions} />
          </div>
        </div>

        {/* Categorized Completion Table Column */}
        <div className="col card" style={{ padding: 20, flex: 2, minWidth: 400 }}>
          <h3>Rotations Completion Progress</h3>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 16px 0" }}>
            Accomplishments grouped by medical procedure type against required target ({targetProceduresCount} logs per procedure).
          </p>

          <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: 8 }}>Procedure Name</th>
                <th style={{ textAlign: "center", padding: 8, width: 140 }}>Target</th>
                <th style={{ textAlign: "right", padding: 8, width: 140 }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {procedureTypes.map((type) => {
                if (type.procedures.length === 0) return null;

                return (
                  <React.Fragment key={type.id}>
                    {/* Category Header */}
                    <tr className="proc-type-hdr" style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "2px solid var(--border)" }}>
                      <td colSpan={3} style={{ padding: "8px 10px", fontWeight: "bold", color: "var(--brand-red)" }}>
                        📂 {type.name}
                      </td>
                    </tr>
                    {type.procedures.map((p) => {
                      const completedCount = logCounts.get(p.id) ?? 0;
                      const pct = Math.min(Math.round((completedCount / targetProceduresCount) * 100), 100);
                      return (
                        <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "8px 16px" }}>{p.name}</td>
                          <td style={{ padding: 8, textAlign: "center" }}>{targetProceduresCount}</td>
                          <td style={{ padding: 8, textAlign: "right" }}>
                            <span style={{
                              fontWeight: "bold",
                              color: completedCount >= targetProceduresCount ? "#137333" : completedCount >= 5 ? "#cd9804" : "#c52744"
                            }}>
                              {completedCount} / {targetProceduresCount} ({pct}%)
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logging History Table Column (no-print) */}
      <div className="card no-print" style={{ padding: 20, marginTop: 24 }}>
        <h3>Your Logged History</h3>
        {logs.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No procedures logged yet.</p>
        ) : (
          <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: 8 }}>Date</th>
                <th style={{ textAlign: "left", padding: 8 }}>Procedure</th>
                <th style={{ textAlign: "left", padding: 8 }}>Patient HRN</th>
                <th style={{ textAlign: "center", padding: 8 }}>Supervision</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: LogRow) => (
                <tr key={log.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: 8, fontSize: 13 }}>
                    {log.loggedAt.toISOString().slice(0, 10)}
                  </td>
                  <td style={{ padding: 8 }}>
                    <strong>{log.procedure.name}</strong><br />
                    <small style={{ color: "var(--muted)" }}>{log.procedure.type.name}</small>
                  </td>
                  <td style={{ padding: 8, fontFamily: "monospace" }}>{log.patientHRN}</td>
                  <td style={{ padding: 8, textAlign: "center" }}>
                    <span style={{
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontSize: 11,
                      backgroundColor: log.status === "COMPLETED" ? "#e6f4ea" : "#fff3cd",
                      color: log.status === "COMPLETED" ? "#137333" : "#856404",
                      fontWeight: "500"
                    }}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
