import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar } from "@/components/Calendar";

type PeriodSummary = {
  periodId: string;
  name: string;
  evaluationsCount: number;
  totalPoints: number;
};

export default async function ResidentPage() {
  const { userId } = await requireRole(["RESIDENT"]);

  const periods = await prisma.period.findMany({ orderBy: { startDate: "desc" } });
  type PeriodRow = (typeof periods)[number];

  const evaluations = await prisma.evaluation.findMany({
    where: { residentId: userId },
    include: {
      evaluator: { select: { name: true } },
      form: { select: { title: true } },
    },
  });
  type EvaluationRow = (typeof evaluations)[number];

  const sums = await prisma.score.groupBy({
    by: ["evaluationId"],
    where: { evaluationId: { in: evaluations.map((e) => e.id) } },
    _sum: { points: true },
  });

  const evalToPoints = new Map<string, number>();
  for (const s of sums) evalToPoints.set(s.evaluationId, s._sum.points ?? 0);

  const totalsByPeriod = new Map<string, { count: number; points: number }>();
  for (const e of evaluations) {
    if (e.status === "SUBMITTED") {
      const cur = totalsByPeriod.get(e.periodId) ?? { count: 0, points: 0 };
      cur.count += 1;
      cur.points += evalToPoints.get(e.id) ?? 0;
      totalsByPeriod.set(e.periodId, cur);
    }
  }

  const summary: PeriodSummary[] = periods.map((p: PeriodRow) => {
    const t = totalsByPeriod.get(p.id) ?? { count: 0, points: 0 };
    return { periodId: p.id, name: p.name, evaluationsCount: t.count, totalPoints: t.points };
  });

  const dbEvents = await prisma.calendarEvent.findMany({
    orderBy: { date: "asc" },
  });

  // Prepare calendar events for resident evaluations
  const calendarEvents = [
    ...evaluations.map((e) => ({
      id: e.id,
      date: e.submittedAt,
      title: e.form.title,
      description: `Evaluator: ${e.evaluator.name}\nStatus: ${e.status}\nLogged: ${e.submittedAt.toLocaleDateString()}`,
      color: "var(--brand-red)",
    })),
    ...dbEvents.map((ev) => ({
      id: ev.id,
      date: ev.date,
      title: ev.title,
      description: ev.details || "",
      color: ev.color,
      startTime: ev.startTime,
      endTime: ev.endTime,
      url: ev.url,
      location: ev.location,
      details: ev.details,
    })),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="card">
        <div className="row" style={{ alignItems: "center", marginBottom: 20 }}>
          <div className="col">
            <h1>My Grade Summary</h1>
          </div>
          <div className="col text-center" style={{ textAlign: "right" }}>
            <Link href="/resident/procedures" className="button-primary" style={{ textDecoration: "none" }}>
              Log Procedures / Track Progress →
            </Link>
          </div>
        </div>

        <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)" }}>
              <th style={{ textAlign: "left", padding: 8 }}>Period</th>
              <th style={{ textAlign: "center", padding: 8 }}># Evaluations (Submitted)</th>
              <th style={{ textAlign: "right", padding: 8 }}>Total Points</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((s) => (
              <tr key={s.periodId} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: 8 }}><strong>{s.name}</strong></td>
                <td style={{ padding: 8, textAlign: "center" }}>{s.evaluationsCount}</td>
                <td style={{ padding: 8, textAlign: "right", color: "var(--brand-red)", fontWeight: "bold" }}>
                  {s.totalPoints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calendar Card */}
      <div className="card">
        <h2>My Evaluation Calendar</h2>
        <p style={{ color: "var(--muted)", margin: "4px 0 16px 0", fontSize: 14 }}>
          Click on any event to see details or customize its highlight color.
        </p>
        <Calendar events={calendarEvents} />
      </div>
    </div>
  );
}
