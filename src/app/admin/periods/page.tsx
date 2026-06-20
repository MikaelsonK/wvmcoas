import Link from "next/link";
import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import { CreatePeriodForm } from "@/components/CreatePeriodForm";

export default async function AdminPeriodsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { q = "" } = await searchParams;

  const periods = await prisma.period.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : {},
    orderBy: { startDate: "desc" },
  });

  type PeriodRow = (typeof periods)[number];

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-gray-900">Academic & Assessment Periods</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage schedule ranges and academic grading periods.</p>
      </div>

      <div className="flex gap-5 items-start flex-wrap">

        {/* Create form */}
        <div className="w-72 shrink-0 bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-[13.5px] font-bold text-gray-900 mb-4">Create Period</h2>
          <CreatePeriodForm />
        </div>

        {/* List */}
        <div className="flex-1 min-w-[320px] bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3">
            <h2 className="text-[13.5px] font-bold text-gray-900 shrink-0">Configured Periods</h2>
            <form className="flex-1 max-w-[240px]">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search periods…"
                className="w-full px-3 py-1.5 text-[12.5px] text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 placeholder:text-gray-400"
              />
            </form>
          </div>
          {periods.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400">
              {q ? `No periods matching "${q}".` : "No periods configured yet."}
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Name</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Start Date</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">End Date</th>
                  <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Grading</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((p: PeriodRow) => (
                  <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-[13px] font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-500">
                      {p.startDate.toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-500">
                      {p.endDate.toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/grading/${p.id}`}
                        className="text-[11px] font-semibold text-brand-red hover:underline"
                      >
                        Open Sheet
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
