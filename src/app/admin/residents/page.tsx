import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";

export default async function AdminResidentsPage() {
  await requireRole(["ADMIN"]);

  const residents = await prisma.user.findMany({
    where: { role: "RESIDENT" },
    include: { residentProfile: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="card">
      <h1>Residents</h1>

      <form method="POST" action="/api/admin/residents" className="row" style={{ marginBottom: 16 }}>
        <div className="col">
          <label>Name</label>
          <input name="name" required />
        </div>
        <div className="col">
          <label>Email</label>
          <input name="email" type="email" required />
        </div>
        <div className="col">
          <label>Year Level</label>
          <input name="yearLevel" type="number" min={1} max={10} required />
        </div>
        <div className="col">
          <label>Temp Password</label>
          <input name="password" type="password" minLength={6} required />
        </div>
        <div className="col">
          <label>&nbsp;</label>
          <button>Create</button>
        </div>
      </form>

      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Year</th></tr>
        </thead>
        <tbody>
          {residents.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.email}</td>
              <td>{r.residentProfile ? r.residentProfile.yearLevel : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
