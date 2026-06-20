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

  const selectClass = "px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all duration-150 focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 w-full sm:w-64";

  return (
    <div className="p-6 print:p-0 print:bg-white print:text-black">
      <div className="flex gap-4 flex-wrap items-center justify-between border-b border-gray-200 pb-5 mb-5 print:border-none">
        <div>
          <h1 className="text-lg font-bold text-gray-900 print:text-xl print:font-bold">Procedure Monitoring & Summary</h1>
          <p className="text-sm text-gray-400 mt-0.5 print:hidden">
            Overview of total resident clinical accomplishments vs target requirement logs.
          </p>
        </div>
        <div className="flex gap-2.5 items-center print:hidden">
          <PrintButton
            label="🖨️ Print Summary"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-red hover:bg-[#8a0606] transition-colors"
          />
          <Link
            href="/admin"
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors"
          >
            ← Back to Admin
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 print:hidden">
        <form method="GET" action="/admin/procedure-summary" className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-period" className="text-[12.5px] font-semibold text-gray-600">Evaluation Period</label>
            <select id="filter-period" name="period" className={selectClass} defaultValue={activePeriodId}>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.startDate.toISOString().slice(0, 10)} to {p.endDate.toISOString().slice(0, 10)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-year" className="text-[12.5px] font-semibold text-gray-600">Resident Year Level</label>
            <select id="filter-year" name="year" className={selectClass} defaultValue={selectedYear}>
              <option value="all">All Year Levels</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 print:mb-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm print:border print:border-black print:p-2 print:shadow-none">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block print:text-black">Matching Residents</span>
          <strong className="text-2xl font-bold text-brand-red mt-1 block print:text-xl print:text-black">{residentsCount}</strong>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm print:border print:border-black print:p-2 print:shadow-none">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block print:text-black">Total Completed Logs</span>
          <strong className="text-2xl font-bold text-brand-gold mt-1 block print:text-xl print:text-black">{logs.length}</strong>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm print:border print:border-black print:p-2 print:shadow-none">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block print:text-black">Active Period</span>
          <strong className="text-lg font-bold text-gray-800 mt-1.5 block truncate print:text-base print:text-black">{activePeriod?.name || "None"}</strong>
        </div>
      </div>

      {/* Categorized Procedure Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm print:border print:border-black print:shadow-none print:rounded-none">
        <div className="px-5 py-4 border-b border-gray-100 print:hidden">
          <h2 className="text-[13.5px] font-bold text-gray-900">Procedure Logs Breakdown</h2>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 print:bg-gray-100 print:border-b print:border-black">
              <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 print:text-black print:font-bold">Procedure Name</th>
              <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-32 print:text-black print:font-bold">Completions</th>
              <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-32 print:text-black print:font-bold">Target (Cohort)</th>
              <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-40 print:text-black print:font-bold">Cohort Accomplished</th>
            </tr>
          </thead>
          <tbody>
            {procedureTypes.map((type) => {
              if (type.procedures.length === 0) return null;

              return (
                <React.Fragment key={type.id}>
                  {/* Category Header Row */}
                  <tr className="bg-gray-50/70 border-y border-gray-200/60 print:bg-gray-200 print:border-y print:border-black print:break-inside-avoid">
                    <td colSpan={4} className="px-4 py-2.5 font-bold text-brand-red text-[13.5px] print:text-black">
                      📂 {type.name} Procedures
                    </td>
                  </tr>
                  {type.procedures.map((p) => {
                    const completed = logCounts.get(p.id) ?? 0;
                    const completionRate = Math.min(Math.round((completed / totalTarget) * 100), 100);

                    let rateColor = "text-red-600";
                    if (completionRate >= 80) {
                      rateColor = "text-green-700 print:text-black";
                    } else if (completionRate >= 50) {
                      rateColor = "text-amber-600 print:text-black";
                    }

                    return (
                      <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors print:border-b print:border-black print:break-inside-avoid">
                        <td className="px-5 py-2.5 text-[13px] text-gray-700 print:text-black">{p.name}</td>
                        <td className="px-4 py-2.5 text-[13px] font-semibold text-gray-900 text-center print:text-black">{completed}</td>
                        <td className="px-4 py-2.5 text-[13px] text-gray-400 text-center print:text-black">{totalTarget}</td>
                        <td className="px-4 py-2.5 text-[13px] text-right">
                          <span className={`font-semibold ${rateColor}`}>
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
