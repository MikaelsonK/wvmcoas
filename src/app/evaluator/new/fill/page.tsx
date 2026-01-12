import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function FillEvaluationPage({
  searchParams,
}: {
  searchParams: { residentId?: string; periodId?: string; formId?: string };
}) {
  await requireRole(["EVALUATOR"]);

  const residentId = searchParams.residentId ?? "";
  const periodId = searchParams.periodId ?? "";
  const formId = searchParams.formId ?? "";
  if (!residentId || !periodId || !formId) redirect("/evaluator/new");

  const resident = await prisma.user.findUnique({ where: { id: residentId } });
  const period = await prisma.period.findUnique({ where: { id: periodId } });
  const form = await prisma.form.findUnique({ where: { id: formId }, include: { questions: true } });

  if (!resident || !period || !form) redirect("/evaluator/new");

  return (
    <div className="card">
      <h1>Fill Evaluation</h1>
      <p>
        Resident: <strong>{resident.name}</strong><br />
        Period: <strong>{period.name}</strong><br />
        Form: <strong>{form.title}</strong>
      </p>

      <form method="POST" action="/api/admin/evaluations" className="card">
        <input type="hidden" name="residentId" value={residentId} />
        <input type="hidden" name="periodId" value={periodId} />
        <input type="hidden" name="formId" value={formId} />

        {form.questions.map((q) => (
          <div key={q.id} style={{ marginBottom: 12 }}>
            <label>{q.label} (0..{q.maxPoints})</label>
            <input name={`q_${q.id}`} type="number" min={0} max={q.maxPoints} required />
          </div>
        ))}

        <button>Submit</button>
      </form>
    </div>
  );
}
