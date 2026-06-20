"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/requireRole";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Period name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: "Start date must be before or equal to the end date",
  path: ["endDate"],
});

export type FormState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
};

export async function createPeriod(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await requireRole(["ADMIN"]);

    const raw = {
      name: formData.get("name") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
    };

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    const { name, startDate, endDate } = parsed.data;

    await prisma.period.create({
      data: {
        name: name.trim(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    revalidatePath("/admin/periods");
    return { success: true };
  } catch (err: any) {
    if (err.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    return { message: err.message || "Something went wrong." };
  }
}
