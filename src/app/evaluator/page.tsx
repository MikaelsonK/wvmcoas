import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function EvaluatorHome({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; period?: string; form?: string }>;
}) {
  const { userId } = await requireRole(["EVALUATOR"]);

  const params = await searchParams;
  const activeTab = params.status || "DRAFT";
  const selectedPeriod = params.period || "";
  const selectedForm = params.form || "";

  // Fetch all filter options
  const periods = await prisma.period.findMany({ orderBy: { startDate: "desc" } });
  const forms = await prisma.form.findMany({ orderBy: { title: "asc" } });

  // Fetch evaluations matching active status & filters
  const evaluations = await prisma.evaluation.findMany({
    where: {
      evaluatorId: userId,
      status: activeTab as any,
      ...(selectedPeriod ? { periodId: selectedPeriod } : {}),
      ...(selectedForm ? { formId: selectedForm } : {}),
    },
    include: {
      resident: { select: { name: true } },
      form: { select: { title: true } },
      period: { select: { name: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  type EvalRow = (typeof evaluations)[number];

  const tabLink = (status: string) => {
    const parts = [`status=${status}`];
    if (selectedPeriod) parts.push(`period=${selectedPeriod}`);
    if (selectedForm) parts.push(`form=${selectedForm}`);
    return `/evaluator?${parts.join("&")}`;
  };

  const selectClass = "px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all duration-150 focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 w-full sm:w-64";

  return (
    <div className="p-6">
      <div className="flex gap-4 flex-wrap items-center justify-between border-b border-gray-200 pb-5 mb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Evaluations Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Review pending assignments, manage drafts, and browse submitted resident scorecards.
          </p>
        </div>
        <Link
          href="/evaluator/new"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-red hover:bg-[#8a0606] transition-colors"
        >
          ➕ Submit New Evaluation
        </Link>
      </div>

      {/* Filters Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <form method="GET" action="/evaluator" className="flex flex-wrap gap-4 items-end">
          <input type="hidden" name="status" value={activeTab} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-period" className="text-[12.5px] font-semibold text-gray-600">Filter by Period</label>
            <select id="filter-period" name="period" className={selectClass} defaultValue={selectedPeriod}>
              <option value="">All Periods</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-form" className="text-[12.5px] font-semibold text-gray-600">Filter by Assessment Form</label>
            <select id="filter-form" name="form" className={selectClass} defaultValue={selectedForm}>
              <option value="">All Forms</option>
              {forms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="submit"
              className="flex-1 sm:flex-initial px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Filter
            </button>
            {(selectedPeriod || selectedForm) && (
              <Link
                href={`/evaluator?status=${activeTab}`}
                className="flex-1 sm:flex-initial px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors text-center inline-flex items-center justify-center"
              >
                Clear
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Status Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {["DRAFT", "PENDING", "SUBMITTED"].map((status) => {
          const isActive = activeTab === status;
          const label = status === "DRAFT" ? "Drafts" : status === "PENDING" ? "Pending" : "Submitted";
          return (
            <Link
              key={status}
              href={tabLink(status)}
              className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                isActive
                  ? "border-brand-red text-brand-red font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-250"
              }`}
            >
              {label} ({status === activeTab ? evaluations.length : "..."})
            </Link>
          );
        })}
      </div>

      {/* Table Listing */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {evaluations.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">No evaluations found matching the criteria.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Resident Doctor</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Period</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Form Title</th>
                <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-36">Date Created</th>
                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((ev: EvalRow) => (
                <tr key={ev.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-[13px] font-semibold text-gray-900">
                    {ev.resident.name}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-500">{ev.period.name}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-500">{ev.form.title}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-500 text-center">
                    {ev.submittedAt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {ev.status !== "SUBMITTED" ? (
                      <Link
                        href={`/evaluator/new/fill?evaluationId=${ev.id}`}
                        className="inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-gold hover:bg-[#a37903] transition-colors"
                      >
                        ✏️ Continue Draft
                      </Link>
                    ) : (
                      <Link
                        href={`/resident/ratings/${ev.id}`}
                        className="inline-flex px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                      >
                        👁️ View Details
                      </Link>
                    )}
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
