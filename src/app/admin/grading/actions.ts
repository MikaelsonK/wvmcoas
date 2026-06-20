"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/requireRole";

export async function revertEvaluation(id: string, periodId: string): Promise<void> {
  await requireRole(["ADMIN"]);

  await prisma.evaluation.update({
    where: { id },
    data: { status: "DRAFT" },
  });

  revalidatePath(`/admin/grading/${periodId}`);
}
