"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/requireRole";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Domain name is required"),
  parentId: z.string().optional().nullable(),
});

export type FormState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
};

export async function createDomain(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await requireRole(["ADMIN"]);

    const raw = {
      name: formData.get("name") as string,
      parentId: formData.get("parentId") as string | null,
    };

    const parsed = schema.safeParse({
      name: raw.name,
      parentId: raw.parentId === "" ? null : raw.parentId,
    });

    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    const { name, parentId } = parsed.data;

    await prisma.domain.create({
      data: {
        name: name.trim(),
        parentId,
      },
    });

    revalidatePath("/admin/domains");
    return { success: true };
  } catch (err: any) {
    if (err.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    return { message: err.message || "Something went wrong." };
  }
}

export async function deleteDomain(id: string): Promise<void> {
  await requireRole(["ADMIN"]);

  await prisma.domain.delete({
    where: { id },
  });

  revalidatePath("/admin/domains");
}
