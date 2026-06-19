import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { RegisterResidentForm } from "@/components/RegisterResidentForm";

export default async function AdminResidentsPage() {
  await requireRole(["ADMIN"]);

  const residents = await prisma.user.findMany({
    where: { role: "RESIDENT" },
    include: { residentProfile: true },
    orderBy: { name: "asc" },
  });

  type ResidentRow = (typeof residents)[number];

  return (
    <div className="card">
      <div className="row" style={{ alignItems: "center", marginBottom: 24 }}>
        <div className="col">
          <h1>Residents (Doctors)</h1>
          <p style={{ margin: "4px 0 0 0", color: "var(--muted)" }}>Pre-register and monitor resident medical staff.</p>
        </div>
        <div className="col text-center" style={{ textAlign: "right" }}>
          <Link href="/admin" className="button-secondary" style={{ textDecoration: "none" }}>
            ← Back to Admin Console
          </Link>
        </div>
      </div>

      <div className="row">
        {/* Create Card Column */}
        <div className="col card" style={{ padding: 20, marginBottom: 20 }}>
          <h3>Register Resident</h3>
          <RegisterResidentForm />
        </div>

        {/* List Card Column */}
        <div className="col card" style={{ padding: 20, flex: 2 }}>
          <h3>Registry List</h3>
          {residents.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No residents configured yet.</p>
          ) : (
            <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: 8 }}>Avatar</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Name</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Email</th>
                  <th style={{ textAlign: "center", padding: 8 }}>Year Level</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Contact No.</th>
                </tr>
              </thead>
              <tbody>
                {residents.map((r: ResidentRow) => {
                  const initials = r.name ? r.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "R";
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: 8 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          backgroundColor: "var(--brand-red)",
                          color: "white",
                          fontWeight: "bold",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: 12
                        }}>
                          {initials}
                        </div>
                      </td>
                      <td style={{ padding: 8 }}><strong>{r.name}</strong></td>
                      <td style={{ padding: 8 }}>{r.email}</td>
                      <td style={{ padding: 8, textAlign: "center" }}>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 12,
                          backgroundColor: "var(--bg-secondary)",
                          border: "1px solid var(--border)",
                          fontWeight: "bold"
                        }}>
                          Year {r.residentProfile ? r.residentProfile.yearLevel : "-"}
                        </span>
                      </td>
                      <td style={{ padding: 8 }}>{r.contactNo || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
