import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDomainsPage() {
  await requireRole(["ADMIN"]);

  const domains = await prisma.domain.findMany({
    include: {
      parent: true,
      children: true,
    },
    orderBy: { name: "asc" },
  });

  type DomainRow = (typeof domains)[number];

  // Helper to render hierarchical structure
  const rootDomains = domains.filter((d) => !d.parentId);
  
  return (
    <div className="card">
      <div className="row" style={{ alignItems: "center", marginBottom: 24 }}>
        <div className="col">
          <h1>Domain Management</h1>
        </div>
        <div className="col text-center" style={{ textAlign: "right" }}>
          <Link href="/admin" className="button-secondary" style={{ textDecoration: "none" }}>
            ← Back to Admin Console
          </Link>
        </div>
      </div>

      <div className="row">
        {/* Create Domain Column */}
        <div className="col card" style={{ padding: 20, marginBottom: 20 }}>
          <h3>Create New Domain</h3>
          <form method="POST" action="/api/admin/domains">
            <div className="form-group">
              <label className="form-label" htmlFor="domain-name">Domain Name</label>
              <input 
                id="domain-name"
                name="name" 
                className="input-field" 
                placeholder="e.g. Patient Care & Safety" 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="parent-domain">Parent Domain (Optional)</label>
              <select id="parent-domain" name="parentId" className="input-field">
                <option value="">None (Make Root)</option>
                {domains.map((d: DomainRow) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="button-primary" style={{ width: "100%", marginTop: 12 }}>
              Add Domain
            </button>
          </form>
        </div>

        {/* List Domains Column */}
        <div className="col card" style={{ padding: 20, flex: 2 }}>
          <h3>Existing Domains Hierarchy</h3>
          
          {domains.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No domains configured yet.</p>
          ) : (
            <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: 8 }}>Name</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Parent Domain</th>
                  <th style={{ textAlign: "right", padding: 8 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((d: DomainRow) => (
                  <tr key={d.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: 8 }}>
                      {d.parentId ? (
                        <span style={{ color: "var(--muted)", marginRight: 8 }}>—</span>
                      ) : null}
                      <strong>{d.name}</strong>
                    </td>
                    <td style={{ padding: 8, color: "var(--muted)" }}>
                      {d.parent ? d.parent.name : "None (Root)"}
                    </td>
                    <td style={{ padding: 8, textAlign: "right" }}>
                      <form method="POST" action={`/api/admin/domains/${d.id}?action=delete`} style={{ display: "inline" }}>
                        <button type="submit" className="button-primary" style={{ padding: "4px 8px", fontSize: 12, backgroundColor: "var(--brand-crimson)" }}>
                          Delete
                        </button>
                      </form>
                    </td>
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
