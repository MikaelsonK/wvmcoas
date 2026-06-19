import Link from "next/link";
import { requireRole } from "@/lib/requireRole";

export default async function AdminPage() {
  await requireRole(["ADMIN"]);

  return (
    <div className="card">
      <h1>Admin</h1>
      <ul>
        <li><Link href="/admin/domains">Domain Management</Link></li>
        <li><Link href="/admin/procedures">Procedure Management</Link></li>
        <li><Link href="/admin/residents">Residents (Doctors)</Link></li>
        <li><Link href="/admin/evaluators">Evaluators (Doctors)</Link></li>
        <li><Link href="/admin/patients">Patient Records</Link></li>
        <li><Link href="/admin/periods">Periods</Link></li>
        <li><Link href="/admin/forms">Forms</Link></li>
      </ul>
    </div>
  );
}
