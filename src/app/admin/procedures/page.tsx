import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminProceduresPage() {
  await requireRole(["ADMIN"]);

  const procedureTypes = await prisma.procedureType.findMany({
    include: {
      procedures: true,
    },
    orderBy: { name: "asc" },
  });

  type TypeRow = (typeof procedureTypes)[number];
  type ProcRow = TypeRow["procedures"][number];

  return (
    <div className="card">
      <div className="row" style={{ alignItems: "center", marginBottom: 24 }}>
        <div className="col">
          <h1>Procedure Management</h1>
        </div>
        <div className="col text-center" style={{ textAlign: "right" }}>
          <Link href="/admin" className="button-secondary" style={{ textDecoration: "none" }}>
            ← Back to Admin Console
          </Link>
        </div>
      </div>

      <div className="row">
        {/* Forms column */}
        <div className="col" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Create Procedure Type Card */}
          <div className="card" style={{ padding: 20 }}>
            <h3>Create Procedure Type</h3>
            <form method="POST" action="/api/admin/procedures">
              <input type="hidden" name="formType" value="type" />
              <div className="form-group">
                <label className="form-label" htmlFor="type-name">Type Name</label>
                <input 
                  id="type-name"
                  name="name" 
                  className="input-field" 
                  placeholder="e.g. Major Surgery, Minor Procedure" 
                  required 
                />
              </div>
              <button type="submit" className="button-primary" style={{ width: "100%", marginTop: 8 }}>
                Add Procedure Type
              </button>
            </form>
          </div>

          {/* Create Procedure Card */}
          <div className="card" style={{ padding: 20 }}>
            <h3>Create Procedure</h3>
            <form method="POST" action="/api/admin/procedures">
              <input type="hidden" name="formType" value="procedure" />
              <div className="form-group">
                <label className="form-label" htmlFor="procedure-name">Procedure Name</label>
                <input 
                  id="procedure-name"
                  name="name" 
                  className="input-field" 
                  placeholder="e.g. Appendectomy, Intubation" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="proc-type-id">Procedure Type</label>
                <select id="proc-type-id" name="procedureTypeId" className="input-field" required>
                  <option value="">Select Category...</option>
                  {procedureTypes.map((t: TypeRow) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="button-primary" style={{ width: "100%", marginTop: 8 }}>
                Add Procedure
              </button>
            </form>
          </div>
        </div>

        {/* List column */}
        <div className="col card" style={{ padding: 20, flex: 2 }}>
          <h3>Existing Categories & Procedures</h3>
          {procedureTypes.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No categories or procedures set up yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {procedureTypes.map((type: TypeRow) => (
                <div key={type.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 16, backgroundColor: "var(--bg-secondary)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h4 style={{ margin: 0, fontSize: 18, color: "var(--brand-red)" }}>{type.name}</h4>
                    <form method="POST" action={`/api/admin/procedures/${type.id}?action=delete&item=type`}>
                      <button type="submit" className="button-primary" style={{ padding: "4px 8px", fontSize: 12, backgroundColor: "var(--brand-crimson)" }}>
                        Delete Category
                      </button>
                    </form>
                  </div>

                  {type.procedures.length === 0 ? (
                    <p style={{ color: "var(--muted)", margin: 0, fontSize: 14 }}>No procedures in this category.</p>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {type.procedures.map((proc: ProcRow) => (
                        <li key={proc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                          <span>{proc.name}</span>
                          <form method="POST" action={`/api/admin/procedures/${proc.id}?action=delete&item=procedure`}>
                            <button type="submit" className="button-primary" style={{ padding: "2px 6px", fontSize: 10, backgroundColor: "var(--brand-crimson)" }}>
                              Delete
                            </button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
