import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ResidentRatingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["RESIDENT", "EVALUATOR", "ADMIN"]);
  const { id } = await params;

  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: {
      evaluator: { select: { name: true, email: true } },
      form: {
        include: {
          questions: true,
        },
      },
      scores: {
        include: {
          question: true,
        },
      },
      period: { select: { name: true } },
    },
  });

  if (!evaluation) {
    return (
      <div className="card">
        <h1>Evaluation Not Found</h1>
        <p style={{ color: "var(--muted)" }}>The evaluation you requested could not be found or has been deleted.</p>
        <Link href="/resident/ratings" className="button-secondary" style={{ textDecoration: "none", marginTop: 12, display: "inline-block" }}>
          ← Back to Ratings
        </Link>
      </div>
    );
  }

  const scoreMap = new Map<string, number>();
  for (const s of evaluation.scores) {
    scoreMap.set(s.questionId, s.points);
  }

  let totalScored = 0;
  let totalMax = 0;
  
  const questionRows = evaluation.form.questions.map((q) => {
    const scoredPoints = scoreMap.get(q.id) ?? 0;
    totalScored += scoredPoints;
    totalMax += q.maxPoints;
    const percentage = q.maxPoints > 0 ? Math.round((scoredPoints / q.maxPoints) * 100) : 0;
    return {
      id: q.id,
      label: q.label,
      maxPoints: q.maxPoints,
      scoredPoints,
      percentage,
    };
  });

  const totalPercentage = totalMax > 0 ? Math.round((totalScored / totalMax) * 100) : 0;

  return (
    <div className="card">
      <div className="row" style={{ alignItems: "center", marginBottom: 24 }}>
        <div className="col">
          <h1>Evaluation Performance Details</h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)" }}>
            Detailed breakdown of scores for evaluation form <strong>{evaluation.form.title}</strong>
          </p>
        </div>
        <div className="col text-center" style={{ textAlign: "right" }}>
          <Link href="/resident/ratings" className="button-secondary" style={{ textDecoration: "none" }}>
            ← Back to Ratings
          </Link>
        </div>
      </div>

      <div className="row" style={{ gap: 24, marginBottom: 24 }}>
        {/* Info Card */}
        <div className="col card" style={{ padding: 20, flex: 2, backgroundColor: "var(--bg-secondary)" }}>
          <h3 style={{ borderBottom: "2px solid var(--brand-gold)", paddingBottom: 8, color: "var(--brand-red)" }}>
            Metadata & Evaluator Info
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: 12 }}>Evaluator Name</span>
              <strong>{evaluation.evaluator.name}</strong>
            </div>
            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: 12 }}>Evaluator Email</span>
              <strong>{evaluation.evaluator.email}</strong>
            </div>
            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: 12 }}>Evaluation Period</span>
              <strong>{evaluation.period.name}</strong>
            </div>
            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: 12 }}>Submission Date</span>
              <strong>{evaluation.submittedAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
            </div>
          </div>
        </div>

        {/* Scoring Summary Card */}
        <div className="col card" style={{ padding: 20, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", border: "2px solid var(--brand-red)" }}>
          <h3 style={{ margin: 0, color: "var(--text)" }}>Total Score</h3>
          <div style={{ fontSize: 48, fontWeight: "bold", color: "var(--brand-red)", margin: "16px 0" }}>
            {totalScored} <span style={{ fontSize: 24, color: "var(--muted)" }}>/ {totalMax}</span>
          </div>
          <div style={{
            padding: "8px 16px",
            borderRadius: 20,
            backgroundColor: totalPercentage >= 85 ? "#e6f4ea" : totalPercentage >= 70 ? "#fff3cd" : "#feedf0",
            color: totalPercentage >= 85 ? "#137333" : totalPercentage >= 70 ? "#856404" : "#c52744",
            fontWeight: "bold",
            fontSize: 16
          }}>
            {totalPercentage}% Average Rating
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3>Question-by-Question Scores</h3>
        <table className="table" style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)" }}>
              <th style={{ textAlign: "left", padding: 12 }}>Evaluation Criteria / Question</th>
              <th style={{ textAlign: "center", padding: 12, width: 120 }}>Scored Points</th>
              <th style={{ textAlign: "center", padding: 12, width: 120 }}>Max Points</th>
              <th style={{ textAlign: "right", padding: 12, width: 120 }}>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {questionRows.map((q) => (
              <tr key={q.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: 12 }}>
                  <strong>{q.label}</strong>
                </td>
                <td style={{ padding: 12, textAlign: "center", fontWeight: "bold", color: "var(--brand-red)" }}>
                  {q.scoredPoints}
                </td>
                <td style={{ padding: 12, textAlign: "center", color: "var(--muted)" }}>
                  {q.maxPoints}
                </td>
                <td style={{ padding: 12, textAlign: "right", fontWeight: "500" }}>
                  {q.percentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
