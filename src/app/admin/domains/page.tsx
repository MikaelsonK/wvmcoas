import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import { CreateDomainModalTrigger } from "@/components/CreateDomainForm";
import { deleteDomain } from "./actions";
import { SearchBar } from "@/components/SearchBar";

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
    <div className="p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Domains Config</h1>
          <p className="text-sm text-gray-400 mt-0.5">Configure and manage clinical domain hierarchy.</p>
        </div>
        <CreateDomainModalTrigger domains={allDomains} />
      </div>

      {/* List */}
      <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3">
            <h2 className="text-[13.5px] font-bold text-gray-900 shrink-0">Domain Hierarchy</h2>
            <SearchBar placeholder="Search domains…" defaultValue={q} />
          </div>
          {domains.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400">
              {q ? `No domains matching "${q}".` : "No domains configured yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
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
            </div>
          )}
        </div>
    </div>
  );
}
