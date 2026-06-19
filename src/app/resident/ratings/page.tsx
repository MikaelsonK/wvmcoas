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
    <div className="card">
      <div className="row" style={{ alignItems: "center", marginBottom: 24 }}>
        <div className="col">
          <h1>My Ratings & Evaluations</h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)" }}>
            Review evaluation feedback, domain scores, and supervisor commentary.
          </p>
        </div>
        <div className="col text-center" style={{ textAlign: "right" }}>
          <Link href="/resident" className="button-secondary" style={{ textDecoration: "none" }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3>Submitted Evaluations</h3>
        {evaluations.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No evaluations have been logged for you yet.</p>
        ) : (
          <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: 12 }}>Evaluation Form Name</th>
                <th style={{ textAlign: "center", padding: 12 }}>Status</th>
                <th style={{ textAlign: "left", padding: 12 }}>Submitted Date</th>
                <th style={{ textAlign: "left", padding: 12 }}>Evaluated By</th>
                <th style={{ textAlign: "left", padding: 12 }}>Updated Date</th>
                <th style={{ textAlign: "right", padding: 12 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((ev: EvalRow) => (
                <tr key={ev.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: 12 }}>
                    <strong>{ev.form.title}</strong>
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: "500",
                        backgroundColor: ev.status === "SUBMITTED" ? "#e6f4ea" : "#fff3cd",
                        color: ev.status === "SUBMITTED" ? "#137333" : "#856404",
                      }}
                    >
                      {ev.status}
                    </span>
                  </td>
                  <td style={{ padding: 12, fontSize: 13 }}>
                    {ev.submittedAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </td>
                  <td style={{ padding: 12 }}>
                    {ev.evaluator.name}
                  </td>
                  <td style={{ padding: 12, fontSize: 13 }}>
                    {ev.submittedAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </td>
                  <td style={{ padding: 12, textAlign: "right" }}>
                    <Link
                      href={`/resident/ratings/${ev.id}`}
                      className="button-primary"
                      style={{
                        textDecoration: "none",
                        padding: "6px 12px",
                        fontSize: 12,
                      }}
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
