import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import { RegisterPatientModalTrigger } from "@/components/RegisterPatientForm";
import { SearchBar } from "@/components/SearchBar";

export default async function AdminPatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { q = "" } = await searchParams;

  const patients = await prisma.patient.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { hrn: { contains: q, mode: "insensitive" } }] }
      : undefined,
    orderBy: { name: "asc" },
  });

  type PatientRow = (typeof patients)[number];

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Patient Records</h1>
          <p className="text-sm text-gray-400 mt-0.5">Configure and monitor hospital patient details.</p>
        </div>
        <RegisterPatientModalTrigger />
      </div>

      {/* List */}
      <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3">
          <h2 className="text-[13.5px] font-bold text-gray-900 shrink-0">Patient Registry</h2>
            <SearchBar placeholder="Search name or HRN…" defaultValue={q} />
          </div>
          {patients.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400">
              {q ? `No patients matching "${q}".` : "No patient records found."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">HRN</th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Name</th>
                    <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Age / Gender</th>
                    <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Civil Status</th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p: PatientRow) => (
                    <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-[12px] text-gray-700 font-semibold">{p.hrn}</td>
                      <td className="px-4 py-3 text-[13px] font-medium text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 text-[13px] text-gray-500 text-center">{p.age} / {p.gender}</td>
                      <td className="px-4 py-3 text-[13px] text-gray-500 text-center">{p.civilStatus || "—"}</td>
                      <td className="px-4 py-3 text-[13px] text-gray-500">{p.email || "—"}</td>
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
