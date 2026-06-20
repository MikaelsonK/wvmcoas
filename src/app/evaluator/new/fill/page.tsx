import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EvaluationForm } from "@/components/EvaluationForm";

export default async function FillEvaluationPage({
  searchParams,
}: {
  searchParams: Promise<{ residentId?: string; periodId?: string; formId?: string; evaluationId?: string }>;
}) {
  await requireRole(["EVALUATOR"]);

  const params = await searchParams;
  const evaluationId = params.evaluationId ?? "";
  let residentId = params.residentId ?? "";
  let periodId = params.periodId ?? "";
  let formId = params.formId ?? "";

  let evaluation = null;
  if (evaluationId) {
    evaluation = await prisma.evaluation.findUnique({
      where: { id: evaluationId },
      include: { scores: true }
    });
    if (evaluation) {
      residentId = evaluation.residentId;
      periodId = evaluation.periodId;
      formId = evaluation.formId;
    }
  }

  if (!residentId || !periodId || !formId) redirect("/evaluator/new");

  const resident = await prisma.user.findUnique({ where: { id: residentId } });
  const period = await prisma.period.findUnique({ where: { id: periodId } });
  const form = await prisma.form.findUnique({ where: { id: formId }, include: { questions: true } });

  if (!resident || !period || !form) redirect("/evaluator/new");

  const initialScores: Record<string, number> = {};
  if (evaluation) {
    for (const s of evaluation.scores) {
      initialScores[s.questionId] = s.points;
    }
  }

  const questions = form.questions.map((q) => ({
    id: q.id,
    label: q.label,
    maxPoints: q.maxPoints,
  }));

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex gap-4 flex-wrap items-center justify-between border-b border-gray-200 pb-5 mb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{evaluation ? "Edit Evaluation Draft" : "Fill Evaluation Form"}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Resident: <span className="font-semibold text-gray-600">{resident.name}</span> | Period: <span className="font-semibold text-gray-600">{period.name}</span> | Form: <span className="font-semibold text-gray-600">{form.title}</span>
          </p>
        </div>
        <Link
          href="/evaluator"
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors"
        >
          Cancel & Return
        </Link>
      </div>

      <EvaluationForm
        residentId={residentId}
        periodId={periodId}
        formId={formId}
        evaluationId={evaluationId}
        questions={questions}
        initialScores={initialScores}
      />
    </div>
  );
}
