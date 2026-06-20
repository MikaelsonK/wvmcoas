"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  hrn: z.string().min(1, "Patient HRN is required"),
  name: z.string().min(1, "Name is required"),
  age: z.coerce.number().int().min(0, "Age must be a positive number"),
  gender: z.string().min(1, "Gender is required"),
  civilStatus: z.string().optional().nullable(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
});

export type FormState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
};

export async function registerPatient(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    hrn: formData.get("hrn") as string,
    name: formData.get("name") as string,
    age: formData.get("age") as string,
    gender: formData.get("gender") as string,
    civilStatus: formData.get("civilStatus") as string | null,
    email: formData.get("email") as string | null,
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { hrn, name, age, gender, civilStatus, email } = parsed.data;

  try {
    const existing = await prisma.patient.findUnique({ where: { hrn } });
    if (existing) {
      return { message: "A patient with this HRN is already registered." };
    }

    await prisma.patient.create({
      data: {
        hrn,
        name,
        age,
        gender,
        civilStatus: civilStatus || null,
        email: email || null,
      },
    });

    revalidatePath("/admin/patients");
    return { success: true };
  } catch (err: any) {
    return { message: err.message || "Failed to register patient." };
  }
}
