import Link from "next/link";
import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";

type Row = {
  residentId: string;
  name: string;
  email: string;
  yearLevel: number | null;
  evaluationsCount: number;
  totalPoints: number;
};

export default async function GradingSheetPage({ params }: { params: { periodId: string } }) {
  await requireRole(["ADMIN"]);

  const period = await prisma.period.findUnique({ where: { id: params.periodId } });
  if (!period) {
    return (
      <div className="card">
        <h1>Period not found</h1>
        <Link href="/admin/periods">Back</Link>
      </div>
    );
  }

  const residents = await prisma.user.findMany({
    where: { role: "RESIDENT" },
    include: { residentProfile: true },
    orderBy: { name: "asc" },
  });

  const evaluations = await prisma.evaluation.findMany({
    where: { periodId: params.periodId },
    select: { id: true, residentId: true },
  });

  const scoreSums = await prisma.score.groupBy({
    by: ["evaluationId"],
    where: { evaluationId: { in: evaluations.map((e) => e.id) } },
    _sum: { points: true },
  });

  const evalPoints = new Map<string, number>();
  for (const s of scoreSums) evalPoints.set(s.evaluationId, s._sum.points ?? 0);

  const totalsByResident = new Map<string, { count: number; points: number }>();
  for (const e of evaluations) {
    const cur = totalsByResident.get(e.residentId) ?? { count: 0, points: 0 };
    cur.count += 1;
    cur.points += evalPoints.get(e.id) ?? 0;
    totalsByResident.set(e.residentId, cur);
  }

  const rows: Row[] = residents.map((r) => {
    const t = totalsByResident.get(r.id) ?? { count: 0, points: 0 };
    return {
      residentId: r.id,
      name: r.name,
      email: r.email,
      yearLevel: r.residentProfile ? r.residentProfile.yearLevel : null,
      evaluationsCount: t.count,
      totalPoints: t.points,
    };
  });

  return (
    <div className="card">
      <h1>Grading Sheet</h1>
      <p>
        <strong>{period.name}</strong>{" "}
        <small>({period.startDate.toISOString().slice(0, 10)} → {period.endDate.toISOString().slice(0, 10)})</small>
      </p>

      <div className="row" style={{ marginBottom: 12 }}>
        <div className="col"><Link href="/admin/periods">← Back to Periods</Link></div>
        <div className="col"><Link href={`/api/admin/grading/${params.periodId}/export`}>Download CSV</Link></div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Resident</th>
            <th>Email</th>
            <th>Year</th>
            <th># Evaluations</th>
            <th>Total Points</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.residentId}>
              <td>{r.name}</td>
              <td>{r.email}</td>
              <td>{r.yearLevel ?? "-"}</td>
              <td>{r.evaluationsCount}</td>
              <td>{r.totalPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
