import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminFormsPage() {
  await requireRole(["ADMIN"]);

  const forms = await prisma.form.findMany({
    select: {
      id: true,
      title: true,
      domainId: true,
      domain: { select: { name: true } },
      questions: { select: { id: true, label: true, maxPoints: true, weight: true, questionType: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const domains = await prisma.domain.findMany({
    orderBy: { name: "asc" },
  });

  type FormRow = (typeof forms)[number];
  type DomainRow = (typeof domains)[number];

  return (
    <div className="card">
      <div className="row" style={{ alignItems: "center", marginBottom: 24 }}>
        <div className="col">
          <h1>Form Management</h1>
        </div>
        <div className="col text-center" style={{ textAlign: "right" }}>
          <Link href="/admin" className="button-secondary" style={{ textDecoration: "none" }}>
            ← Back to Admin Console
          </Link>
        </div>
      </div>

      <form method="POST" action="/api/admin/forms" className="card" style={{ marginBottom: 24, padding: 20 }}>
        <h3>Create Dynamic Evaluation Form</h3>
        <div className="row" style={{ marginBottom: 16 }}>
          <div className="col">
            <label className="form-label" htmlFor="form-title">Form Title</label>
            <input id="form-title" name="title" className="input-field" placeholder="e.g. End of Rotation Assessment" required />
          </div>
          <div className="col">
            <label className="form-label" htmlFor="form-domain">Map to Domain (Optional)</label>
            <select id="form-domain" name="domainId" className="input-field">
              <option value="">None / Unmapped</option>
              {domains.map((d: DomainRow) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <h3>Questions (configure up to 5)</h3>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="row" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 12, alignItems: "flex-end" }}>
            <div className="col" style={{ flex: 2 }}>
              <label className="form-label" htmlFor={`q-label-${i}`}>Question {i + 1} Label</label>
              <input id={`q-label-${i}`} name={`qLabel_${i}`} className="input-field" placeholder="e.g. Demonstration of surgical skills" />
            </div>
            <div className="col">
              <label className="form-label" htmlFor={`q-max-${i}`}>Max Points</label>
              <input id={`q-max-${i}`} name={`qMax_${i}`} type="number" min={1} max={100} className="input-field" placeholder="10" />
            </div>
            <div className="col">
              <label className="form-label" htmlFor={`q-weight-${i}`}>Weight (Float)</label>
              <input id={`q-weight-${i}`} name={`qWeight_${i}`} type="number" step="0.01" className="input-field" placeholder="1.0" />
            </div>
            <div className="col">
              <label className="form-label" htmlFor={`q-type-${i}`}>Question Type</label>
              <select id={`q-type-${i}`} name={`qType_${i}`} className="input-field">
                <option value="single_select">Single Select (Numeric Score)</option>
                <option value="multi_select">Multi Select</option>
                <option value="text">Text Response</option>
              </select>
            </div>
          </div>
        ))}

        <button type="submit" className="button-primary" style={{ marginTop: 12 }}>
          Create Form
        </button>
      </form>

      <h3>Configured Forms</h3>
      {forms.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No forms created yet.</p>
      ) : (
        <table className="table" style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)" }}>
              <th style={{ textAlign: "left", padding: 8 }}>Form Title</th>
              <th style={{ textAlign: "left", padding: 8 }}>Domain</th>
              <th style={{ textAlign: "center", padding: 8 }}># Questions</th>
              <th style={{ textAlign: "right", padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((f: FormRow) => (
              <tr key={f.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: 8 }}><strong>{f.title}</strong></td>
                <td style={{ padding: 8, color: "var(--muted)" }}>{f.domain ? f.domain.name : "Unmapped"}</td>
                <td style={{ padding: 8, textAlign: "center" }}>{f.questions.length}</td>
                <td style={{ padding: 8, textAlign: "right" }}>
                  <form method="POST" action={`/api/admin/forms/${f.id}/duplicate`} style={{ display: "inline" }}>
                    <button type="submit" className="button-primary" style={{ padding: "4px 10px", fontSize: 12, backgroundColor: "var(--brand-gold)" }}>
                      Duplicate
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
