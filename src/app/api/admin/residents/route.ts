import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formDataToStrings } from "@/lib/formData";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  yearLevel: z.coerce.number().int().min(1).max(10),
  password: z.string().min(6),
  contactNo: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = formDataToStrings(await req.formData());
  const parsed = schema.safeParse({
    name: raw.name,
    email: raw.email,
    yearLevel: raw.yearLevel === "" ? undefined : Number(raw.yearLevel),
    password: raw.password,
    contactNo: raw.contactNo === "" ? null : raw.contactNo,
  });
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "RESIDENT",
      contactNo: parsed.data.contactNo,
      residentProfile: { create: { yearLevel: parsed.data.yearLevel } },
    },
  });

  return NextResponse.redirect(new URL("/admin/residents", req.url));
}
