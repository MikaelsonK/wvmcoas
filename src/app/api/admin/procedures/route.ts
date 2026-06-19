import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formDataToStrings } from "@/lib/formData";

const typeSchema = z.object({
  name: z.string().min(1),
});

const procedureSchema = z.object({
  name: z.string().min(1),
  procedureTypeId: z.string().min(1),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const procedures = await prisma.procedure.findMany({
    include: {
      type: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(procedures);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = formDataToStrings(await req.formData());
  const formType = raw.formType; // "procedure" or "type"

  if (formType === "type") {
    const parsed = typeSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ error: "Invalid type input" }, { status: 400 });

    await prisma.procedureType.create({
      data: { name: parsed.data.name },
    });
  } else {
    const parsed = procedureSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ error: "Invalid procedure input" }, { status: 400 });

    await prisma.procedure.create({
      data: {
        name: parsed.data.name,
        procedureTypeId: parsed.data.procedureTypeId,
      },
    });
  }

  return NextResponse.redirect(new URL("/admin/procedures", req.url));
}
