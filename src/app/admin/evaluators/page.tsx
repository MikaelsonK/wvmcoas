import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { RegisterEvaluatorForm } from "@/components/RegisterEvaluatorForm";

export default async function AdminEvaluatorsPage() {
  await requireRole(["ADMIN"]);

  const evaluators = await prisma.user.findMany({
    select: { id: true, name: true, email: true, contactNo: true },
    where: { role: "EVALUATOR" },
    orderBy: { name: "asc" },
  });

  type EvaluatorRow = (typeof evaluators)[number];

  return (
    <div className="card">
      <div className="row" style={{ alignItems: "center", marginBottom: 24 }}>
        <div className="col">
          <h1>Evaluators (Doctors)</h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)" }}>Manage attending physicians and assessment supervisors.</p>
        </div>
        <div className="col text-center" style={{ textAlign: "right" }}>
          <Link href="/admin" className="button-secondary" style={{ textDecoration: "none" }}>
            ← Back to Admin Console
          </Link>
        </div>
      </div>

      <div className="row">
        {/* Create Card Column */}
        <div className="col card" style={{ padding: 20, marginBottom: 20 }}>
          <h3>Register Evaluator</h3>
          <RegisterEvaluatorForm />
        </div>

        {/* List Card Column */}
        <div className="col card" style={{ padding: 20, flex: 2 }}>
          <h3>Registry List</h3>
          {evaluators.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No evaluators configured yet.</p>
          ) : (
            <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: 8 }}>Avatar</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Name</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Email</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Contact No.</th>
                </tr>
              </thead>
              <tbody>
                {evaluators.map((e: EvaluatorRow) => {
                  const initials = e.name ? e.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "D";
                  return (
                    <tr key={e.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: 8 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          backgroundColor: "var(--brand-gold)",
                          color: "white",
                          fontWeight: "bold",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: 12
                        }}>
                          {initials}
                        </div>
                      </td>
                      <td style={{ padding: 8 }}><strong>{e.name}</strong></td>
                      <td style={{ padding: 8 }}>{e.email}</td>
                      <td style={{ padding: 8 }}>{e.contactNo || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
