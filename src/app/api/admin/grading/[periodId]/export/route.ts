import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ periodId: string }> }) {
  const { periodId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const period = await prisma.period.findUnique({ where: { id: periodId } });
  if (!period) return NextResponse.json({ error: "Period not found" }, { status: 404 });

  const residents = await prisma.user.findMany({
    where: { role: "RESIDENT" },
    include: { residentProfile: true },
    orderBy: { name: "asc" },
  });

  const evaluations = await prisma.evaluation.findMany({
    where: { periodId, status: "SUBMITTED" },
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

  // Construct CSV content
  const headers = ["Resident Name", "Email", "Year Level", "Submitted Evaluations", "Total Points"];
  const rows = residents.map((r) => {
    const t = totalsByResident.get(r.id) ?? { count: 0, points: 0 };
    return [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.email}"`,
      r.residentProfile ? r.residentProfile.yearLevel : "-",
      t.count,
      t.points,
    ];
  });

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const periodSlug = period.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");

  return new Response(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=grading_sheet_${periodSlug}.csv`,
    },
  });
}
