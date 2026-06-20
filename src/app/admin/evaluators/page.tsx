import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import { RegisterEvaluatorModalTrigger } from "@/components/RegisterEvaluatorForm";
import { SearchBar } from "@/components/SearchBar";

export default async function AdminEvaluatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { q = "" } = await searchParams;

  const evaluators = await prisma.user.findMany({
    select: { id: true, name: true, email: true, contactNo: true },
    where: {
      role: "EVALUATOR",
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}),
    },
    orderBy: { name: "asc" },
  });

  type EvaluatorRow = (typeof evaluators)[number];

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Evaluators (Doctors)</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage attending physicians and assessment supervisors.</p>
        </div>
        <RegisterEvaluatorModalTrigger />
      </div>

      {/* List */}
      <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3">
            <h2 className="text-[13.5px] font-bold text-gray-900 shrink-0">Registry List</h2>
            <SearchBar placeholder="Search name or email…" defaultValue={q} />
          </div>
          {evaluators.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400">
              {q ? `No evaluators matching "${q}".` : "No evaluators configured yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Name</th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Email</th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluators.map((e: EvaluatorRow) => {
                    const initials = e.name ? e.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "D";
                    return (
                      <tr key={e.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-brand-gold/15 text-brand-gold text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                              {initials}
                            </div>
                            <span className="text-[13px] font-medium text-gray-900">{e.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-500">{e.email}</td>
                        <td className="px-4 py-3 text-[13px] text-gray-500">{e.contactNo || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </div>
  );
}
