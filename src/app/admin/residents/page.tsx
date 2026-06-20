import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import { RegisterResidentModalTrigger } from "@/components/RegisterResidentForm";
import { SearchBar } from "@/components/SearchBar";
import { YearFilter } from "@/components/YearFilter";

export default async function AdminResidentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; year?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { q = "", year } = await searchParams;
  const yearNum = year ? parseInt(year) : undefined;

  const residents = await prisma.user.findMany({
    where: {
      role: "RESIDENT",
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}),
      ...(yearNum ? { residentProfile: { yearLevel: yearNum } } : {}),
    },
    include: { residentProfile: true },
    orderBy: { name: "asc" },
  });

  type ResidentRow = (typeof residents)[number];

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Residents (Doctors)</h1>
          <p className="text-sm text-gray-400 mt-0.5">Pre-register and monitor resident medical staff.</p>
        </div>
        <RegisterResidentModalTrigger />
      </div>

      {/* List */}
      <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-[13.5px] font-bold text-gray-900 shrink-0">Registry List</h2>
            <div className="flex gap-2 flex-1 max-w-md">
              <SearchBar placeholder="Search name or email…" defaultValue={q} />
              <YearFilter defaultValue={year} />
            </div>
          </div>
          {residents.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400">
              {q || year ? "No residents matching your filters." : "No residents configured yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Name</th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Email</th>
                    <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Year</th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {residents.map((r: ResidentRow) => {
                    const initials = r.name ? r.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "R";
                    return (
                      <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-brand-red/10 text-brand-red text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                              {initials}
                            </div>
                            <span className="text-[13px] font-medium text-gray-900">{r.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-500">{r.email}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-600">
                            Y{r.residentProfile?.yearLevel ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-500">{r.contactNo || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </div>
  );
}
