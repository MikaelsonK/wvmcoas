import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";

export default async function NewEvaluationPage() {
  await requireRole(["EVALUATOR"]);

  const residents = await prisma.user.findMany({ where: { role: "RESIDENT" }, orderBy: { name: "asc" } });
  const periods = await prisma.period.findMany({ orderBy: { startDate: "desc" } });
  const forms = await prisma.form.findMany({ include: { questions: true }, orderBy: { createdAt: "desc" } });

  type ResidentRow = (typeof residents)[number];
  type PeriodRow = (typeof periods)[number];
  type FormRow = (typeof forms)[number];


  return (
    <div className="card">
      <h1>New Evaluation</h1>

      <form method="POST" action="/api/admin/evaluations/prepare" className="card">
        <div className="row">
          <div className="col">
            <label>Resident</label>
            <select name="residentId" required>
              <option value="">Select...</option>
              {residents.map((r: ResidentRow) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="col">
            <label>Period</label>
            <select name="periodId" required>
              <option value="">Select...</option>
              {periods.map((p: PeriodRow) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="col">
            <label>Form</label>
            <select name="formId" required>
              <option value="">Select...</option>
              {forms.map((f: FormRow) => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
          </div>
        </div>

        <button style={{ marginTop: 12 }} className="secondary">Load Form</button>
      </form>
    </div>
  );
}
