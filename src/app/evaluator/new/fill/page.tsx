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
  let evaluationId = params.evaluationId ?? "";
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
    <div className="card">
      <div className="row" style={{ alignItems: "center", marginBottom: 20 }}>
        <div className="col">
          <h1>{evaluation ? "Edit Evaluation Draft" : "Fill Evaluation Form"}</h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)" }}>
            Resident: <strong>{resident.name}</strong> | Period: <strong>{period.name}</strong> | Form: <strong>{form.title}</strong>
          </p>
        </div>
        <div className="col text-center" style={{ textAlign: "right" }}>
          <Link href="/evaluator" className="button-secondary" style={{ textDecoration: "none" }}>
            Cancel & Return
          </Link>
        </div>
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
