import Link from "next/link";
import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/PrintButton";
import React from "react";

export default async function AdminProcedureSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; year?: string }>;
}) {
  await requireRole(["ADMIN"]);

  const params = await searchParams;
  const selectedPeriod = params.period || "";
  const selectedYear = params.year || "all";

  // Fetch filter options
  const periods = await prisma.period.findMany({ orderBy: { startDate: "desc" } });
  const activePeriodId = selectedPeriod || (periods[0]?.id ?? "");
  const activePeriod = periods.find((p) => p.id === activePeriodId);

  // Fetch all procedure types and their procedures
  const procedureTypes = await prisma.procedureType.findMany({
    include: {
      procedures: {
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  // Count the number of residents matching the year filter
  const residentsCount = await prisma.user.count({
    where: {
      role: "RESIDENT",
      ...(selectedYear !== "all"
        ? {
            residentProfile: {
              yearLevel: Number(selectedYear),
            },
          }
        : {}),
    },
  });

  // Fetch logs matching filters
  const logs = await prisma.procedureLog.findMany({
    where: {
      ...(activePeriod
        ? {
            loggedAt: {
              gte: activePeriod.startDate,
              lte: activePeriod.endDate,
            },
          }
        : {}),
      resident: {
        role: "RESIDENT",
        ...(selectedYear !== "all"
          ? {
              residentProfile: {
                yearLevel: Number(selectedYear),
              },
            }
          : {}),
      },
    },
    select: {
      id: true,
      procedureId: true,
      status: true,
    },
  });

  // Calculate completions per procedure
  const logCounts = new Map<string, number>();
  for (const log of logs) {
    logCounts.set(log.procedureId, (logCounts.get(log.procedureId) ?? 0) + 1);
  }

  const targetPerResident = 15; // Target is 15 completions per procedure
  const totalTarget = Math.max(residentsCount, 1) * targetPerResident;

  return (
    <div className="card">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-family: 'Poppins', sans-serif !important;
          }
          aside, header, nav, button, .button-primary, .button-secondary, .no-print, .filters-container {
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
          .proc-type-header {
            background-color: #f2f2f2 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}} />

      <div className="row" style={{ alignItems: "center", marginBottom: 20 }}>
        <div className="col">
          <h1>Procedure Monitoring & Summary</h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)" }}>
            Overview of total resident clinical accomplishments vs target requirement logs.
          </p>
        </div>
        <div className="col text-center no-print" style={{ textAlign: "right", display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <PrintButton label="🖨️ Print Summary" className="button-primary" style={{ backgroundColor: "var(--brand-red)" }} />
          <Link href="/admin" className="button-secondary" style={{ textDecoration: "none" }}>
            ← Back to Admin
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card filters-container" style={{ padding: 16, marginBottom: 24, backgroundColor: "var(--bg-secondary)" }}>
        <form method="GET" action="/admin/procedure-summary">
          <div className="row" style={{ alignItems: "flex-end", marginBottom: 0 }}>
            <div className="col form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="filter-period">Evaluation Period</label>
              <select id="filter-period" name="period" className="input-field" defaultValue={activePeriodId}>
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.startDate.toISOString().slice(0, 10)} to {p.endDate.toISOString().slice(0, 10)})
                  </option>
                ))}
              </select>
            </div>
            <div className="col form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="filter-year">Resident Year Level</label>
              <select id="filter-year" name="year" className="input-field" defaultValue={selectedYear}>
                <option value="all">All Year Levels</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
              </select>
            </div>
            <div className="col-auto">
              <button type="submit" className="button-secondary" style={{ padding: "10px 20px" }}>
                Apply Filters
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Summary Stats */}
      <div className="row" style={{ marginBottom: 24, gap: 16 }}>
        <div className="col card" style={{ padding: 16, backgroundColor: "var(--bg-secondary)" }}>
          <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: "bold" }}>MATCHING RESIDENTS</span>
          <strong style={{ fontSize: 24, color: "var(--brand-red)" }}>{residentsCount}</strong>
        </div>
        <div className="col card" style={{ padding: 16, backgroundColor: "var(--bg-secondary)" }}>
          <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: "bold" }}>TOTAL COMPLETED LOGS</span>
          <strong style={{ fontSize: 24, color: "var(--brand-gold)" }}>{logs.length}</strong>
        </div>
        <div className="col card" style={{ padding: 16, backgroundColor: "var(--bg-secondary)" }}>
          <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: "bold" }}>ACTIVE PERIOD</span>
          <strong style={{ fontSize: 18, color: "var(--text)" }}>{activePeriod?.name || "None"}</strong>
        </div>
      </div>

      {/* Categorized Procedure Table */}
      <div className="card" style={{ padding: 20 }}>
        <h3>Procedure Logs Breakdown</h3>
        <table className="table" style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)" }}>
              <th style={{ textAlign: "left", padding: 10 }}>Procedure Name</th>
              <th style={{ textAlign: "center", padding: 10, width: 150 }}>Completions</th>
              <th style={{ textAlign: "center", padding: 10, width: 150 }}>Target (Cohort)</th>
              <th style={{ textAlign: "right", padding: 10, width: 150 }}>Cohort Accomplished</th>
            </tr>
          </thead>
          <tbody>
            {procedureTypes.map((type) => {
              if (type.procedures.length === 0) return null;

              return (
                <React.Fragment key={type.id}>
                  {/* Category Header Row */}
                  <tr className="proc-type-header" style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "2px solid var(--border)" }}>
                    <td colSpan={4} style={{ padding: "10px 8px", fontWeight: "bold", color: "var(--brand-red)", fontSize: 14 }}>
                      📂 {type.name} Procedures
                    </td>
                  </tr>
                  {type.procedures.map((p) => {
                    const completed = logCounts.get(p.id) ?? 0;
                    const completionRate = Math.min(Math.round((completed / totalTarget) * 100), 100);

                    return (
                      <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "8px 16px" }}>{p.name}</td>
                        <td style={{ padding: 8, textAlign: "center", fontWeight: "bold" }}>{completed}</td>
                        <td style={{ padding: 8, textAlign: "center", color: "var(--muted)" }}>{totalTarget}</td>
                        <td style={{ padding: 8, textAlign: "right" }}>
                          <span style={{
                            fontWeight: "bold",
                            color: completionRate >= 80 ? "#137333" : completionRate >= 50 ? "#cd9804" : "#c52744"
                          }}>
                            {completed}/{totalTarget} ({completionRate}%)
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
  );
}
