import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import { CreateFormConfigModalTrigger } from "@/components/CreateFormConfigForm";
import { duplicateForm } from "./actions";
import { SearchBar } from "@/components/SearchBar";

export default async function AdminFormsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { q = "" } = await searchParams;

  const forms = await prisma.form.findMany({
    select: {
      id: true,
      title: true,
      domainId: true,
      domain: { select: { name: true } },
      questions: { select: { id: true, label: true, maxPoints: true, weight: true, questionType: true } },
    },
    where: q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { domain: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
  });

  const domains = await prisma.domain.findMany({ orderBy: { name: "asc" } });

  type FormRow = (typeof forms)[number];

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Forms Config</h1>
          <p className="text-sm text-gray-400 mt-0.5">Create and manage dynamic evaluation forms.</p>
        </div>
        <CreateFormConfigModalTrigger domains={domains} />
      </div>

      {/* Forms list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3">
          <h2 className="text-[13.5px] font-bold text-gray-900 shrink-0">Configured Forms</h2>
          <SearchBar placeholder="Search forms or domains…" defaultValue={q} />
        </div>
        {forms.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">
            {q ? `No forms matching "${q}".` : "No forms created yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Form Title</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Domain</th>
                  <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Questions</th>
                  <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((f: FormRow) => (
                  <tr key={f.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-[13px] font-medium text-gray-900">{f.title}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-400">{f.domain ? f.domain.name : "Unmapped"}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-500 text-center">{f.questions.length}</td>
                    <td className="px-4 py-3 text-right">
                      <form action={duplicateForm.bind(null, f.id)} className="inline">
                        <button
                          type="submit"
                          className="text-[11px] font-medium text-brand-gold hover:text-[#a07800] border border-brand-gold/30 hover:border-brand-gold/60 bg-brand-gold/8 hover:bg-brand-gold/15 px-2.5 py-1 rounded transition-colors"
                        >
                          Duplicate
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
