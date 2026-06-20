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
      color: "#a00707", // brand-red
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
    <div className="p-6 flex flex-col gap-6">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-bold text-gray-900">My Grade Summary</h1>
            <p className="text-xs text-gray-400 mt-0.5">Summary of scores across evaluation periods.</p>
          </div>
          <Link
            href="/resident/procedures"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-red hover:bg-[#8a0606] transition-colors"
          >
            Log Procedures / Track Progress →
          </Link>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Period</th>
              <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-48"># Evaluations (Submitted)</th>
              <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-40">Total Points</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((s) => (
              <tr key={s.periodId} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-[13px] font-bold text-gray-900">{s.name}</td>
                <td className="px-4 py-3 text-[13px] text-gray-500 text-center">{s.evaluationsCount}</td>
                <td className="px-4 py-3 text-[13px] font-bold text-brand-red text-right">
                  {s.totalPoints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calendar Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-[14px] font-bold text-gray-900">My Evaluation Calendar</h2>
        <p className="text-xs text-gray-400 mt-0.5 mb-4">
          Click on any event to see details or customize its highlight color.
        </p>
        <Calendar events={calendarEvents} />
      </div>
    </div>
  );
}
