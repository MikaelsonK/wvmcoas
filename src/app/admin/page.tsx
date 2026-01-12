import Link from "next/link";
import { requireRole } from "@/lib/requireRole";

export default async function AdminPage() {
  await requireRole(["ADMIN"]);

  return (
    <div className="card">
      <h1>Admin</h1>
      <ul>
        <li><Link href="/admin/residents">Residents</Link></li>
        <li><Link href="/admin/evaluators">Evaluators</Link></li>
        <li><Link href="/admin/periods">Periods</Link></li>
        <li><Link href="/admin/forms">Forms</Link></li>
      </ul>
    </div>
  );
}
