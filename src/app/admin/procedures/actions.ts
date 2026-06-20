"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/requireRole";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

const procedureSchema = z.object({
  name: z.string().min(1, "Procedure name is required"),
  procedureTypeId: z.string().min(1, "Category selection is required"),
});

export type FormState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
};

export async function createCategory(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await requireRole(["ADMIN"]);

    const raw = {
      name: formData.get("name") as string,
    };

    const parsed = categorySchema.safeParse(raw);
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    await prisma.procedureType.create({
      data: { name: parsed.data.name.trim() },
    });

    revalidatePath("/admin/procedures");
    revalidatePath("/admin/curriculum");
    return { success: true };
  } catch (err: any) {
    if (err.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    return { message: err.message || "Something went wrong." };
  }
}

export async function createProcedure(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await requireRole(["ADMIN"]);

    const raw = {
      name: formData.get("name") as string,
      procedureTypeId: formData.get("procedureTypeId") as string,
    };

    const parsed = procedureSchema.safeParse(raw);
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    const { name, procedureTypeId } = parsed.data;

    await prisma.procedure.create({
      data: {
        name: name.trim(),
        procedureTypeId,
      },
    });

    revalidatePath("/admin/procedures");
    revalidatePath("/admin/curriculum");
    return { success: true };
  } catch (err: any) {
    if (err.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    return { message: err.message || "Something went wrong." };
  }
}

export async function deleteCategory(id: string): Promise<void> {
  await requireRole(["ADMIN"]);

  await prisma.procedureType.delete({
    where: { id },
  });

  revalidatePath("/admin/procedures");
  revalidatePath("/admin/curriculum");
}

export async function deleteProcedure(id: string): Promise<void> {
  await requireRole(["ADMIN"]);

  await prisma.procedure.delete({
    where: { id },
  });

  revalidatePath("/admin/procedures");
  revalidatePath("/admin/curriculum");
}
