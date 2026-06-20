import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import React from "react";
import { PrintButton } from "@/components/PrintButton";
import { ProcedureLogForm } from "@/components/ProcedureLogForm";
import { SearchBar } from "@/components/SearchBar";

export default async function ResidentProceduresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { userId } = await requireRole(["RESIDENT"]);
  const { q = "" } = await searchParams;

  // Fetch all procedure types and procedures matching query
  const procedureTypes = await prisma.procedureType.findMany({
    include: {
      procedures: {
        where: q ? { name: { contains: q, mode: "insensitive" } } : {},
        orderBy: { name: "asc" }
      }
    },
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { procedures: { some: { name: { contains: q, mode: "insensitive" } } } },
          ],
        }
      : {},
    orderBy: { name: "asc" }
  });

  const procedures = await prisma.procedure.findMany({
    include: { type: true },
    orderBy: { name: "asc" },
  });

  // Fetch this resident's logs
  const logs = await prisma.procedureLog.findMany({
    where: {
      residentId: userId,
      ...(q
        ? {
            OR: [
              { procedure: { name: { contains: q, mode: "insensitive" } } },
              { procedure: { type: { name: { contains: q, mode: "insensitive" } } } },
              { patientHRN: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      procedure: {
        include: { type: true },
      },
    },
    orderBy: { loggedAt: "desc" },
  });

  // Calculate completed count per procedure for progress (always evaluate against all procedures)
  const allLogsForResident = await prisma.procedureLog.findMany({
    where: { residentId: userId },
    select: { procedureId: true },
  });

  const logCounts = new Map<string, number>();
  for (const log of allLogsForResident) {
    logCounts.set(log.procedureId, (logCounts.get(log.procedureId) ?? 0) + 1);
  }

  const targetProceduresCount = 15; // Target requirement per procedure
  const totalLogged = allLogsForResident.length;
  
  // Total unique target count = total number of procedures * 15
  const totalProcedures = procedures.length;
  const overallTarget = totalProcedures * targetProceduresCount;
  const completionPercentage = overallTarget > 0 ? Math.min(Math.round((totalLogged / overallTarget) * 100), 100) : 0;

  const procedureOptions = procedures.map((p) => ({
    id: p.id,
    name: p.name,
    typeName: p.type.name,
  }));

  type LogRow = (typeof logs)[number];

  return (
    <div className="p-6 print:p-0 print:bg-white print:text-black">
      <div className="flex gap-4 flex-wrap items-center justify-between border-b border-gray-200 pb-5 mb-5 print:border-none print:pb-0">
        <div>
          <h1 className="text-lg font-bold text-gray-900 print:text-xl print:font-bold">Clinical Procedure Logger & Monitor</h1>
          <p className="text-sm text-gray-400 mt-0.5 print:hidden">
            Log completed operations and track your requirements progress.
          </p>
        </div>
        <div className="flex gap-2.5 items-center print:hidden">
          <PrintButton
            label="🖨️ Print Progress Report"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-red hover:bg-[#8a0606] transition-colors"
          />
          <Link
            href="/resident"
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Progress / Tracker Cards */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6 print:border print:border-black print:shadow-none print:p-3">
        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
          <strong className="text-sm font-bold text-gray-900 print:text-[13px]">Rotations Requirements Completion Track</strong>
          <span className="text-sm font-bold text-brand-red print:text-black">{totalLogged} / {overallTarget} Total Logs</span>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden mb-2 print:hidden">
          <div
            className="h-full bg-brand-red transition-all duration-300 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 print:text-black">
          You have completed {completionPercentage}% of your total procedure targets.
        </p>
      </div>

      <div className="flex gap-5 items-start flex-wrap">
        {/* Logging Form Card Column (hidden when printing) */}
        <div className="w-72 shrink-0 flex flex-col gap-4 print:hidden">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-[13.5px] font-bold text-gray-900 mb-4">Log Completed Procedure</h3>
            <ProcedureLogForm procedures={procedureOptions} />
          </div>
        </div>

        {/* Categorized Completion Table Column */}
        <div className="flex-1 min-w-[320px] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm print:border print:border-black print:shadow-none print:rounded-none">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3 print:hidden">
            <div>
              <h2 className="text-[13.5px] font-bold text-gray-900">Rotations Completion Progress</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Accomplishments vs required target ({targetProceduresCount} logs per procedure).
              </p>
            </div>
            <SearchBar placeholder="Search procedures…" defaultValue={q} className="max-w-[200px]" />
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 print:bg-gray-100 print:border-b print:border-black">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 print:text-black print:font-bold">Procedure Name</th>
                <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-28 print:text-black print:font-bold">Target</th>
                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-36 print:text-black print:font-bold">Progress</th>
              </tr>
            </thead>
            <tbody>
              {procedureTypes.map((type) => {
                if (type.procedures.length === 0) return null;

                return (
                  <React.Fragment key={type.id}>
                    {/* Category Header */}
                    <tr className="bg-gray-50/70 border-y border-gray-200/60 print:bg-gray-200 print:border-y print:border-black print:break-inside-avoid">
                      <td colSpan={3} className="px-4 py-2.5 font-bold text-brand-red text-[13px] print:text-black">
                        📂 {type.name}
                      </td>
                    </tr>
                    {type.procedures.map((p) => {
                      const completedCount = logCounts.get(p.id) ?? 0;
                      const pct = Math.min(Math.round((completedCount / targetProceduresCount) * 100), 100);
                      
                      let progressColor = "text-red-600";
                      if (completedCount >= targetProceduresCount) {
                        progressColor = "text-green-700 print:text-black";
                      } else if (completedCount >= 5) {
                        progressColor = "text-amber-600 print:text-black";
                      }

                      return (
                        <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors print:border-b print:border-black print:break-inside-avoid">
                          <td className="px-5 py-2.5 text-[13px] text-gray-700 print:text-black">{p.name}</td>
                          <td className="px-4 py-2.5 text-[13px] text-gray-400 text-center print:text-black">{targetProceduresCount}</td>
                          <td className="px-4 py-2.5 text-[13px] text-right">
                            <span className={`font-semibold ${progressColor}`}>
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
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mt-6 print:hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-[13.5px] font-bold text-gray-900">Your Logged History</h2>
        </div>
        {logs.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">No procedures logged yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Date</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Procedure</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Patient HRN</th>
                <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Supervision</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: LogRow) => (
                <tr key={log.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-[12.5px] text-gray-500">
                    {log.loggedAt.toISOString().slice(0, 10)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[13px] font-semibold text-gray-900">{log.procedure.name}</div>
                    <div className="text-[11px] text-gray-400">{log.procedure.type.name}</div>
                  </td>
                  <td className="px-4 py-3 text-[13px] font-mono text-gray-700">{log.patientHRN}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      log.status === "COMPLETED"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {log.status === "COMPLETED" ? "Completed" : "Supervised"}
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
