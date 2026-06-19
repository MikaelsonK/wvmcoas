import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function EvaluatorHome({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; period?: string; form?: string }>;
}) {
  const { userId } = await requireRole(["EVALUATOR"]);

  const params = await searchParams;
  const activeTab = params.status || "DRAFT";
  const selectedPeriod = params.period || "";
  const selectedForm = params.form || "";

  // Fetch all filter options
  const periods = await prisma.period.findMany({ orderBy: { startDate: "desc" } });
  const forms = await prisma.form.findMany({ orderBy: { title: "asc" } });

  // Fetch evaluations matching active status & filters
  const evaluations = await prisma.evaluation.findMany({
    where: {
      evaluatorId: userId,
      status: activeTab as any,
      ...(selectedPeriod ? { periodId: selectedPeriod } : {}),
      ...(selectedForm ? { formId: selectedForm } : {}),
    },
    include: {
      resident: { select: { name: true } },
      form: { select: { title: true } },
      period: { select: { name: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  type EvalRow = (typeof evaluations)[number];

  const tabLink = (status: string) => {
    const parts = [`status=${status}`];
    if (selectedPeriod) parts.push(`period=${selectedPeriod}`);
    if (selectedForm) parts.push(`form=${selectedForm}`);
    return `/evaluator?${parts.join("&")}`;
  };

  return (
    <div className="card">
      <div className="row" style={{ alignItems: "center", marginBottom: 24 }}>
        <div className="col">
          <h1>Evaluations Dashboard</h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)" }}>
            Review pending assignments, manage drafts, and browse submitted resident scorecards.
          </p>
        </div>
        <div className="col text-center" style={{ textAlign: "right" }}>
          <Link href="/evaluator/new" className="button-primary" style={{ textDecoration: "none" }}>
            ➕ Submit New Evaluation
          </Link>
        </div>
      </div>

      {/* Filters Form */}
      <div className="card" style={{ padding: 16, marginBottom: 24, backgroundColor: "var(--bg-secondary)" }}>
        <form method="GET" action="/evaluator">
          <input type="hidden" name="status" value={activeTab} />
          <div className="row" style={{ alignItems: "flex-end", marginBottom: 0 }}>
            <div className="col form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="filter-period">Filter by Period</label>
              <select id="filter-period" name="period" className="input-field" defaultValue={selectedPeriod}>
                <option value="">All Periods</option>
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="filter-form">Filter by Assessment Form</label>
              <select id="filter-form" name="form" className="input-field" defaultValue={selectedForm}>
                <option value="">All Forms</option>
                {forms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-auto" style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="button-secondary" style={{ padding: "10px 20px" }}>
                Filter
              </button>
              {(selectedPeriod || selectedForm) && (
                <Link href={`/evaluator?status=${activeTab}`} className="button-secondary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", padding: "10px 20px" }}>
                  Clear
                </Link>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Status Tabs */}
      <div className="row" style={{ borderBottom: "2px solid var(--border)", paddingBottom: 0, marginBottom: 20 }}>
        {["DRAFT", "PENDING", "SUBMITTED"].map((status) => {
          const isActive = activeTab === status;
          const label = status === "DRAFT" ? "Drafts" : status === "PENDING" ? "Pending" : "Submitted";
          return (
            <Link
              key={status}
              href={tabLink(status)}
              style={{
                padding: "10px 20px",
                textDecoration: "none",
                fontWeight: isActive ? "bold" : "normal",
                color: isActive ? "var(--brand-red)" : "var(--muted)",
                borderBottom: isActive ? "3px solid var(--brand-red)" : "3px solid transparent",
                marginBottom: "-2px",
              }}
            >
              {label} ({status === activeTab ? evaluations.length : "..."})
            </Link>
          );
        })}
      </div>

      {/* Table Listing */}
      <div className="card" style={{ padding: 20 }}>
        {evaluations.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No evaluations found matching the criteria.</p>
        ) : (
          <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: 12 }}>Resident Doctor</th>
                <th style={{ textAlign: "left", padding: 12 }}>Period</th>
                <th style={{ textAlign: "left", padding: 12 }}>Form Title</th>
                <th style={{ textAlign: "center", padding: 12 }}>Date Created</th>
                <th style={{ textAlign: "right", padding: 12 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((ev: EvalRow) => (
                <tr key={ev.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: 12 }}>
                    <strong>{ev.resident.name}</strong>
                  </td>
                  <td style={{ padding: 12 }}>{ev.period.name}</td>
                  <td style={{ padding: 12 }}>{ev.form.title}</td>
                  <td style={{ padding: 12, textAlign: "center", fontSize: 13 }}>
                    {ev.submittedAt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td style={{ padding: 12, textAlign: "right" }}>
                    {ev.status !== "SUBMITTED" ? (
                      <Link
                        href={`/evaluator/new/fill?evaluationId=${ev.id}`}
                        className="button-primary"
                        style={{ textDecoration: "none", padding: "6px 12px", fontSize: 12, backgroundColor: "var(--brand-gold)" }}
                      >
                        ✏️ Continue Draft
                      </Link>
                    ) : (
                      <Link
                        href={`/resident/ratings/${ev.id}`}
                        className="button-secondary"
                        style={{ textDecoration: "none", padding: "6px 12px", fontSize: 12 }}
                      >
                        👁️ View Details
                      </Link>
                    )}
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
