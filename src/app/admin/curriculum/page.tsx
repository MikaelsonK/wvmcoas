import { requireRole } from "@/lib/requireRole";
import { prisma } from "@/lib/prisma";
import { CurriculumHubClient } from "./CurriculumHubClient";

export default async function AdminCurriculumPage() {
  await requireRole(["ADMIN"]);

  // Fetch domains
  const domains = await prisma.domain.findMany({
    include: {
      parent: { select: { id: true, name: true } },
      children: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });

  // Fetch procedures
  const procedures = await prisma.procedure.findMany({
    include: {
      type: { select: { name: true } },
      domain: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });

  // Fetch forms
  const forms = await prisma.form.findMany({
    include: {
      domain: { select: { id: true, name: true } },
      procedure: { select: { id: true, name: true } },
      questions: { select: { id: true } },
    },
    orderBy: { title: "asc" },
  });

  // Fetch categories
  const procedureTypes = await prisma.procedureType.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Curriculum Hub</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage clinical domains, procedures, and evaluation forms — and map how they connect.
        </p>
      </div>

      <CurriculumHubClient
        domains={domains}
        procedures={procedures}
        forms={forms}
        procedureTypes={procedureTypes}
      />
    </div>
  );
}
