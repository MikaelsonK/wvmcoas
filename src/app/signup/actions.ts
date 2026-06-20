"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type FormState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
};

export async function signupUser(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { message: "This email is already registered." };
    }

    const hashed = await hashPassword(password);
    const name = email.split("@")[0];

    // Create resident user by default with yearLevel: 1 profile
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashed,
        role: "RESIDENT",
        residentProfile: { create: { yearLevel: 1 } },
      },
    });

    return { success: true };
  } catch (err: any) {
    return { message: err.message || "Failed to register account." };
  }
}
