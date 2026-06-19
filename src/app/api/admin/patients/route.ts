import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formDataToStrings } from "@/lib/formData";

const schema = z.object({
  hrn: z.string().min(1),
  name: z.string().min(1),
  age: z.coerce.number().int().min(0),
  gender: z.string().min(1),
  civilStatus: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patients = await prisma.patient.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(patients);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EVALUATOR")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = formDataToStrings(await req.formData());
  const parsed = schema.safeParse({
    hrn: raw.hrn,
    name: raw.name,
    age: raw.age === "" ? undefined : Number(raw.age),
    gender: raw.gender,
    civilStatus: raw.civilStatus === "" ? null : raw.civilStatus,
    email: raw.email === "" ? null : raw.email,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: `Invalid input: ${parsed.error.issues[0].message}` }, { status: 400 });
  }

  await prisma.patient.create({
    data: {
      hrn: parsed.data.hrn,
      name: parsed.data.name,
      age: parsed.data.age,
      gender: parsed.data.gender,
      civilStatus: parsed.data.civilStatus,
      email: parsed.data.email,
    },
  });

  return NextResponse.redirect(new URL("/admin/patients", req.url));
}
