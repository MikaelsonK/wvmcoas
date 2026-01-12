import { z } from "zod";

const envSchema = z.object({
  NEXTAUTH_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
});

export const env = envSchema.parse({
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
});
