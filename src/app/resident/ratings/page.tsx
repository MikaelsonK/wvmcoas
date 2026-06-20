import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ResidentRatingsPage() {
  const { userId } = await requireRole(["RESIDENT"]);

  const evaluations = await prisma.evaluation.findMany({
    where: { residentId: userId },
    include: {
      evaluator: { select: { name: true } },
      form: { select: { title: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  type EvalRow = (typeof evaluations)[number];

  return (
    <div className="p-6">
      <div className="flex gap-4 flex-wrap items-center justify-between border-b border-gray-200 pb-5 mb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-900">My Ratings & Evaluations</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Review evaluation feedback, domain scores, and supervisor commentary.
          </p>
        </div>
        <Link
          href="/resident"
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-[13.5px] font-bold text-gray-900">Submitted Evaluations</h2>
        </div>
        {evaluations.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">No evaluations have been logged for you yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Evaluation Form Name</th>
                <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-32">Status</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Submitted Date</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Evaluated By</th>
                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-36">Actions</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((ev: EvalRow) => (
                <tr key={ev.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-[13px] font-semibold text-gray-900">
                    {ev.form.title}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold ${
                      ev.status === "SUBMITTED"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {ev.status === "SUBMITTED" ? "Submitted" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-500">
                    {ev.submittedAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-900">
                    {ev.evaluator.name}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/resident/ratings/${ev.id}`}
                      className="inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-red hover:bg-[#8a0606] transition-colors"
                    >
                      View Details
                    </Link>
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
