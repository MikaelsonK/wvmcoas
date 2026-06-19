import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { RegisterPatientForm } from "@/components/RegisterPatientForm";

export default async function AdminPatientsPage() {
  await requireRole(["ADMIN"]);

  const patients = await prisma.patient.findMany({
    orderBy: { name: "asc" },
  });

  type PatientRow = (typeof patients)[number];

  return (
    <div className="card">
      <div className="row" style={{ alignItems: "center", marginBottom: 24 }}>
        <div className="col">
          <h1>Patient Records</h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)" }}>Configure and monitor hospital patient details.</p>
        </div>
        <div className="col text-center" style={{ textAlign: "right" }}>
          <Link href="/admin" className="button-secondary" style={{ textDecoration: "none" }}>
            ← Back to Admin Console
          </Link>
        </div>
      </div>

      <div className="row">
        {/* Create Patient Column */}
        <div className="col card" style={{ padding: 20, marginBottom: 20 }}>
          <h3>Register New Patient</h3>
          <RegisterPatientForm />
        </div>

        {/* Existing Patients List Column */}
        <div className="col card" style={{ padding: 20, flex: 2 }}>
          <h3>Patient Registry</h3>
          {patients.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No patient records found.</p>
          ) : (
            <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: 8 }}>HRN</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Name</th>
                  <th style={{ textAlign: "center", padding: 8 }}>Age/Gender</th>
                  <th style={{ textAlign: "center", padding: 8 }}>Civil Status</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Email</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p: PatientRow) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: 8, fontFamily: "monospace" }}><strong>{p.hrn}</strong></td>
                    <td style={{ padding: 8 }}>{p.name}</td>
                    <td style={{ padding: 8, textAlign: "center" }}>{p.age} / {p.gender}</td>
                    <td style={{ padding: 8, textAlign: "center" }}>{p.civilStatus || "-"}</td>
                    <td style={{ padding: 8 }}>{p.email || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
