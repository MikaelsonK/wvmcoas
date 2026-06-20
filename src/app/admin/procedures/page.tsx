import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import { CreateCategoryForm } from "@/components/CreateCategoryForm";
import { CreateProcedureForm } from "@/components/CreateProcedureForm";
import { deleteCategory, deleteProcedure } from "./actions";

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
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-gray-900">Procedures Config</h1>
        <p className="text-sm text-gray-400 mt-0.5">Define procedure categories and individual procedures.</p>
      </div>

      <div className="flex gap-5 items-start flex-wrap">

        {/* Forms column */}
        <div className="w-72 shrink-0 flex flex-col gap-4">

          {/* Create Category */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-[13.5px] font-bold text-gray-900 mb-4">Create Category</h2>
            <CreateCategoryForm />
          </div>

          {/* Create Procedure */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-[13.5px] font-bold text-gray-900 mb-4">Create Procedure</h2>
            <CreateProcedureForm categories={allCategories} />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 min-w-[320px] bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3">
            <h2 className="text-[13.5px] font-bold text-gray-900 shrink-0">Categories & Procedures</h2>
            <form className="flex-1 max-w-[240px]">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search categories or procedures…"
                className="w-full px-3 py-1.5 text-[12.5px] text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 placeholder:text-gray-400"
              />
            </form>
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
    </div>
  );
}
