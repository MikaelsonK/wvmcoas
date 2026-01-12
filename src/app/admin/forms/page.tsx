import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";

export default async function AdminFormsPage() {
  await requireRole(["ADMIN"]);

  const forms = await prisma.form.findMany({
    select: {
      id: true,
      title: true,
      questions: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  type FormRow = (typeof forms)[number];


  return (
    <div className="card">
      <h1>Forms</h1>

      <form method="POST" action="/api/admin/forms" className="card" style={{ marginBottom: 16 }}>
        <div className="row">
          <div className="col">
            <label>Title</label>
            <input name="title" required />
          </div>
        </div>

        <h3>Questions (up to 5)</h3>

        {[0, 1, 2, 3, 4].map((i) => (
          <div className="row" key={i}>
            <div className="col">
              <label>Label (Q{i + 1})</label>
              <input name={`qLabel_${i}`} placeholder="e.g. Clinical reasoning" />
            </div>
            <div className="col">
              <label>Max Points (Q{i + 1})</label>
              <input name={`qMax_${i}`} type="number" min={1} max={100} />
            </div>
          </div>
        ))}

        <button style={{ marginTop: 12 }}>Create Form</button>
      </form>

      <table>
        <thead>
          <tr><th>Title</th><th># Questions</th></tr>
        </thead>
        <tbody>
          {forms.map((f: FormRow) => (
            <tr key={f.id}>
              <td>{f.title}</td>
              <td>{f.questions.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
