"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hashPassword } from "@/lib/password";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  yearLevel: z.coerce.number().int().min(1, "Year level must be at least 1").max(10, "Year level must be at most 10"),
  contactNo: z.string().optional().nullable(),
});

export type FormState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
};

export async function registerResident(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    yearLevel: formData.get("yearLevel") as string,
    contactNo: formData.get("contactNo") as string | null,
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password, yearLevel, contactNo } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { message: "This email is already registered." };
    }

    const hashed = await hashPassword(password);
    await prisma.user.create({
      data: {
        name,
        email,
        contactNo: contactNo || null,
        passwordHash: hashed,
        role: "RESIDENT",
        residentProfile: { create: { yearLevel } },
      },
    });

    revalidatePath("/admin/residents");
    return { success: true };
  } catch (err: any) {
    return { message: err.message || "Failed to register resident." };
  }
}
