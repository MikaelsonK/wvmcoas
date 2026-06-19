import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formDataToStrings } from "@/lib/formData";

const schema = z.object({
  procedureId: z.string().min(1),
  patientHRN: z.string().min(1),
  patientName: z.string().optional().nullable(),
  patientAge: z.coerce.number().int().optional().nullable(),
  patientGender: z.string().optional().nullable(),
  status: z.string().optional().default("COMPLETED"),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "RESIDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = formDataToStrings(await req.formData());
  
  // Format inputs correctly
  const parsed = schema.safeParse({
    procedureId: raw.procedureId,
    patientHRN: raw.patientHRN,
    patientName: raw.patientName === "" ? null : raw.patientName,
    patientAge: raw.patientAge === "" ? null : Number(raw.patientAge),
    patientGender: raw.patientGender === "" ? null : raw.patientGender,
    status: raw.status || "COMPLETED",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: `Invalid input: ${parsed.error.issues[0].message}` }, { status: 400 });
  }

  await prisma.procedureLog.create({
    data: {
      residentId: session.user.id,
      procedureId: parsed.data.procedureId,
      patientHRN: parsed.data.patientHRN,
      patientName: parsed.data.patientName,
      patientAge: parsed.data.patientAge,
      patientGender: parsed.data.patientGender,
      status: parsed.data.status,
    },
  });

  return NextResponse.redirect(new URL("/resident/procedures", req.url));
}
