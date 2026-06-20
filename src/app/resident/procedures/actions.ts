"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/requireRole";
import { z } from "zod";

const schema = z.object({
  procedureId: z.string().min(1, "Please select a procedure"),
  patientHRN: z.string().min(1, "Patient HRN is required"),
  patientName: z.string().optional().nullable(),
  patientAge: z.coerce.number().int().min(0, "Patient age must be a positive number").optional().nullable(),
  patientGender: z.string().optional().nullable(),
  status: z.string().default("COMPLETED"),
});

export type FormState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
};

export async function createProcedureLog(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const { userId } = await requireRole(["RESIDENT"]);

    const raw = {
      procedureId: formData.get("procedureId") as string,
      patientHRN: formData.get("patientHRN") as string,
      patientName: formData.get("patientName") as string | null,
      patientAge: formData.get("patientAge") as string | null,
      patientGender: formData.get("patientGender") as string | null,
      status: formData.get("status") as string | null,
    };

    const parsed = schema.safeParse({
      procedureId: raw.procedureId,
      patientHRN: raw.patientHRN,
      patientName: raw.patientName === "" ? null : raw.patientName,
      patientAge: raw.patientAge === "" ? null : raw.patientAge,
      patientGender: raw.patientGender === "" ? null : raw.patientGender,
      status: raw.status || "COMPLETED",
    });

    if (!parsed.success) {
      return { errors: parsed.error.flatten().fieldErrors };
    }

    const { procedureId, patientHRN, patientName, patientAge, patientGender, status } = parsed.data;

    await prisma.procedureLog.create({
      data: {
        residentId: userId,
        procedureId,
        patientHRN: patientHRN.trim(),
        patientName: patientName ? patientName.trim() : null,
        patientAge,
        patientGender: patientGender || null,
        status: status || "COMPLETED",
      },
    });

    revalidatePath("/resident/procedures");
    return { success: true };
  } catch (err: any) {
    if (err.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    return { message: err.message || "Failed to log procedure." };
  }
}
