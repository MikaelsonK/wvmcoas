import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import { CreateCategoryModalTrigger } from "@/components/CreateCategoryForm";
import { CreateProcedureModalTrigger } from "@/components/CreateProcedureForm";
import { deleteCategory, deleteProcedure } from "./actions";
import { SearchBar } from "@/components/SearchBar";

export default async function AdminProceduresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { q = "" } = await searchParams;

  // Retrieve matching categories and procedures
  const procedureTypes = await prisma.procedureType.findMany({
    include: {
      procedures: {
        where: q ? { name: { contains: q, mode: "insensitive" } } : {},
        orderBy: { name: "asc" },
      },
    },
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { procedures: { some: { name: { contains: q, mode: "insensitive" } } } },
          ],
        }
      : {},
    orderBy: { name: "asc" },
  });

  // All categories for the dropdown in procedure creation
  const allCategories = await prisma.procedureType.findMany({
    orderBy: { name: "asc" },
  });

  type TypeRow = (typeof procedureTypes)[number];
  type ProcRow = TypeRow["procedures"][number];

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Procedures Config</h1>
          <p className="text-sm text-gray-400 mt-0.5">Define procedure categories and individual procedures.</p>
        </div>
        <div className="flex gap-2">
          <CreateCategoryModalTrigger />
          <CreateProcedureModalTrigger categories={allCategories} />
        </div>
      </div>

      {/* List */}
      <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3">
            <h2 className="text-[13.5px] font-bold text-gray-900 shrink-0">Categories & Procedures</h2>
            <SearchBar placeholder="Search categories or procedures…" defaultValue={q} />
          </div>
          {procedureTypes.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400">
              {q ? `No results matching "${q}".` : "No categories or procedures set up yet."}
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {procedureTypes.map((type: TypeRow) => (
                <div key={type.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-bold text-brand-red">{type.name}</span>
                    <form action={deleteCategory.bind(null, type.id)} className="inline">
                      <button
                        type="submit"
                        className="text-[11px] font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded transition-colors"
                      >
                        Delete Category
                      </button>
                    </form>
                  </div>
                  {type.procedures.length === 0 ? (
                    <p className="text-[12px] text-gray-400 pl-2">No procedures in this category.</p>
                  ) : (
                    <div className="flex flex-col divide-y divide-gray-100 pl-2">
                      {type.procedures.map((proc: ProcRow) => (
                        <div key={proc.id} className="flex items-center justify-between py-2">
                          <span className="text-[13px] text-gray-700">{proc.name}</span>
                          <form action={deleteProcedure.bind(null, proc.id)} className="inline">
                            <button
                              type="submit"
                              className="text-[11px] font-medium text-red-500 hover:text-red-700 border border-red-100 hover:border-red-200 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded transition-colors"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}
