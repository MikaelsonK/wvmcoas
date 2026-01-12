import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";

export default async function AdminEvaluatorsPage() {
  await requireRole(["ADMIN"]);

  const evaluators = await prisma.user.findMany({
    where: { role: "EVALUATOR" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="card">
      <h1>Evaluators</h1>

      <form method="POST" action="/api/admin/evaluators" className="row" style={{ marginBottom: 16 }}>
        <div className="col">
          <label>Name</label>
          <input name="name" required />
        </div>
        <div className="col">
          <label>Email</label>
          <input name="email" type="email" required />
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
          <tr><th>Name</th><th>Email</th></tr>
        </thead>
        <tbody>
          {evaluators.map((e) => (
            <tr key={e.id}>
              <td>{e.name}</td>
              <td>{e.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
