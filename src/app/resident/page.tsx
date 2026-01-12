import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";

type PeriodSummary = {
  periodId: string;
  name: string;
  evaluationsCount: number;
  totalPoints: number;
};

export default async function ResidentPage() {
  const { userId } = await requireRole(["RESIDENT"]);

  const periods = await prisma.period.findMany({ orderBy: { startDate: "desc" } });

  const evaluations = await prisma.evaluation.findMany({
    where: { residentId: userId },
    select: { id: true, periodId: true },
  });

  const sums = await prisma.score.groupBy({
    by: ["evaluationId"],
    where: { evaluationId: { in: evaluations.map((e) => e.id) } },
    _sum: { points: true },
  });

  const evalToPoints = new Map<string, number>();
  for (const s of sums) evalToPoints.set(s.evaluationId, s._sum.points ?? 0);

  const totalsByPeriod = new Map<string, { count: number; points: number }>();
  for (const e of evaluations) {
    const cur = totalsByPeriod.get(e.periodId) ?? { count: 0, points: 0 };
    cur.count += 1;
    cur.points += evalToPoints.get(e.id) ?? 0;
    totalsByPeriod.set(e.periodId, cur);
  }

  const summary: PeriodSummary[] = periods.map((p) => {
    const t = totalsByPeriod.get(p.id) ?? { count: 0, points: 0 };
    return { periodId: p.id, name: p.name, evaluationsCount: t.count, totalPoints: t.points };
  });

  return (
    <div className="card">
      <h1>My Grade Summary</h1>

      <table>
        <thead>
          <tr><th>Period</th><th># Evaluations</th><th>Total Points</th></tr>
        </thead>
        <tbody>
          {summary.map((s) => (
            <tr key={s.periodId}>
              <td>{s.name}</td>
              <td>{s.evaluationsCount}</td>
              <td>{s.totalPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
