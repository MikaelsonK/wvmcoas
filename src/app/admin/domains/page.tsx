import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import { CreateDomainForm } from "@/components/CreateDomainForm";
import { deleteDomain } from "./actions";

export default async function AdminDomainsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { q = "" } = await searchParams;

  // Retrieve matching domains
  const domains = await prisma.domain.findMany({
    include: { parent: true, children: true },
    where: q ? { name: { contains: q, mode: "insensitive" } } : {},
    orderBy: { name: "asc" },
  });

  // All domains for parent selection dropdown
  const allDomains = await prisma.domain.findMany({
    orderBy: { name: "asc" },
  });

  type DomainRow = (typeof domains)[number];

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-gray-900">Domains Config</h1>
        <p className="text-sm text-gray-400 mt-0.5">Configure and manage clinical domain hierarchy.</p>
      </div>

      <div className="flex gap-5 items-start flex-wrap">

        {/* Create form */}
        <div className="w-72 shrink-0 bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-[13.5px] font-bold text-gray-900 mb-4">Create Domain</h2>
          <CreateDomainForm domains={allDomains} />
        </div>

        {/* List */}
        <div className="flex-1 min-w-[320px] bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3">
            <h2 className="text-[13.5px] font-bold text-gray-900 shrink-0">Domain Hierarchy</h2>
            <form className="flex-1 max-w-[240px]">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search domains…"
                className="w-full px-3 py-1.5 text-[12.5px] text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 placeholder:text-gray-400"
              />
            </form>
          </div>
          {domains.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400">
              {q ? `No domains matching "${q}".` : "No domains configured yet."}
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Name</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Parent</th>
                  <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((d: DomainRow) => (
                  <tr key={d.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {d.parentId && <span className="text-gray-300 text-xs">—</span>}
                        <span className="text-[13px] font-medium text-gray-900">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-400">{d.parent ? d.parent.name : "Root"}</td>
                    <td className="px-4 py-3 text-right">
                      <form action={deleteDomain.bind(null, d.id)} className="inline">
                        <button
                          type="submit"
                          className="text-[11px] font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded transition-colors"
                        >
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
