"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/requireRole";

export async function updateProcedureDomain(
  procedureId: string,
  domainId: string | null
): Promise<void> {
  await requireRole(["ADMIN"]);

  await prisma.procedure.update({
    where: { id: procedureId },
    data: { domainId: domainId || null },
  });

  revalidatePath("/admin/curriculum");
}

export async function updateFormMappings(
  formId: string,
  domainId: string | null,
  procedureId: string | null
): Promise<void> {
  await requireRole(["ADMIN"]);

  await prisma.form.update({
    where: { id: formId },
    data: {
      domainId: domainId || null,
      procedureId: procedureId || null,
    },
  });

  revalidatePath("/admin/curriculum");
}

export async function deleteForm(id: string): Promise<void> {
  await requireRole(["ADMIN"]);

  await prisma.form.delete({
    where: { id },
  });

  revalidatePath("/admin/curriculum");
}

export async function deleteDomain(id: string): Promise<void> {
  await requireRole(["ADMIN"]);

  await prisma.domain.delete({
    where: { id },
  });

  revalidatePath("/admin/curriculum");
}

export async function deleteProcedure(id: string): Promise<void> {
  await requireRole(["ADMIN"]);

  await prisma.procedure.delete({
    where: { id },
  });

  revalidatePath("/admin/curriculum");
}
