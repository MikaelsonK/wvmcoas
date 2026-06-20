import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import { RegisterResidentForm } from "@/components/RegisterResidentForm";

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
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-gray-900">Residents (Doctors)</h1>
        <p className="text-sm text-gray-400 mt-0.5">Pre-register and monitor resident medical staff.</p>
      </div>

      <div className="flex gap-5 items-start flex-wrap">

        {/* Register form */}
        <div className="w-72 shrink-0 bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-[13.5px] font-bold text-gray-900 mb-4">Register Resident</h2>
          <RegisterResidentForm />
        </div>

        {/* List */}
        <div className="flex-1 min-w-[320px] bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-[13.5px] font-bold text-gray-900 shrink-0">Registry List</h2>
            {/* URL-state search + year filter */}
            <form className="flex gap-2 flex-1">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search name or email…"
                className="flex-1 min-w-0 px-3 py-1.5 text-[12.5px] text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 placeholder:text-gray-400"
              />
              <select
                name="year"
                defaultValue={year ?? ""}
                className="px-2 py-1.5 text-[12.5px] text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-brand-red"
              >
                <option value="">All Years</option>
                {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
              <button type="submit" className="px-3 py-1.5 text-[12px] font-medium text-white bg-brand-red rounded-lg hover:bg-[#8a0606] transition-colors">Go</button>
            </form>
          </div>
          {residents.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400">
              {q || year ? "No residents matching your filters." : "No residents configured yet."}
            </p>
          ) : (
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
          )}
        </div>

      </div>
    </div>
  );
}
