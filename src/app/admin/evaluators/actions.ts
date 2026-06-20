"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hashPassword } from "@/lib/password";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  contactNo: z.string().optional().nullable(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type FormState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
};

export async function registerEvaluator(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    contactNo: formData.get("contactNo") as string | null,
    password: formData.get("password") as string,
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, contactNo, password } = parsed.data;

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
        role: "EVALUATOR",
      },
    });

    revalidatePath("/admin/evaluators");
    return { success: true };
  } catch (err: any) {
    return { message: err.message || "Failed to register evaluator." };
  }
}
