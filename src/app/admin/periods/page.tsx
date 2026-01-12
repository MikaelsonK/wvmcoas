import Link from "next/link";
import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";

export default async function AdminPeriodsPage() {
  await requireRole(["ADMIN"]);

  const periods = await prisma.period.findMany({
    orderBy: { startDate: "desc" },
  });

  type PeriodRow = (typeof periods)[number];

  return (
    <div className="card">
      <h1>Periods</h1>

      <form method="POST" action="/api/admin/periods" className="row" style={{ marginBottom: 16 }}>
        <div className="col">
          <label>Name</label>
          <input name="name" required />
        </div>
        <div className="col">
          <label>Start Date</label>
          <input name="startDate" type="date" required />
        </div>
        <div className="col">
          <label>End Date</label>
          <input name="endDate" type="date" required />
        </div>
        <div className="col">
          <label>&nbsp;</label>
          <button>Create</button>
        </div>
      </form>

      <table>
        <thead>
          <tr><th>Name</th><th>Start</th><th>End</th><th>Grading</th></tr>
        </thead>
        <tbody>
          {periods.map((p: PeriodRow) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.startDate.toISOString().slice(0, 10)}</td>
              <td>{p.endDate.toISOString().slice(0, 10)}</td>
              <td><Link href={`/admin/grading/${p.id}`}>Open Sheet</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
