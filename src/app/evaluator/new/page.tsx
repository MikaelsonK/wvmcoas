import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { NewEvaluationForm } from "@/components/NewEvaluationForm";

export default async function NewEvaluationPage() {
  await requireRole(["EVALUATOR"]);

  const residents = await prisma.user.findMany({ where: { role: "RESIDENT" }, orderBy: { name: "asc" } });
  const periods = await prisma.period.findMany({ orderBy: { startDate: "desc" } });
  const forms = await prisma.form.findMany({ include: { questions: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex gap-4 flex-wrap items-center justify-between border-b border-gray-200 pb-5 mb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-900">New Evaluation</h1>
          <p className="text-sm text-gray-400 mt-0.5">Select a resident doctor and forms to begin assessment.</p>
        </div>
        <Link
          href="/evaluator"
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <NewEvaluationForm residents={residents} periods={periods} forms={forms} />
      </div>
    </div>
  );
}
