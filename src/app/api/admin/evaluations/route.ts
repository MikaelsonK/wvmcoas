import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formDataToStrings } from "@/lib/formData";

const headerSchema = z.object({
  residentId: z.string().min(1),
  periodId: z.string().min(1),
  formId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "EVALUATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = formDataToStrings(await req.formData());
  const headerParsed = headerSchema.safeParse(raw);
  if (!headerParsed.success) return NextResponse.json({ error: "Missing header fields" }, { status: 400 });

  const form = await prisma.form.findUnique({
    where: { id: headerParsed.data.formId },
    include: { questions: true },
  });
  if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

  const scores: { questionId: string; points: number }[] = [];

  for (const q of form.questions) {
    const key = `q_${q.id}`;
    const v = raw[key];
    if (!v) return NextResponse.json({ error: `Missing score for: ${q.label}` }, { status: 400 });

    const points = Number(v);
    const ok = Number.isInteger(points) && points >= 0 && points <= q.maxPoints;
    if (!ok) return NextResponse.json({ error: `Invalid score for: ${q.label}` }, { status: 400 });

    scores.push({ questionId: q.id, points });
  }

  await prisma.evaluation.create({
    data: {
      evaluatorId: session.user.id,
      residentId: headerParsed.data.residentId,
      periodId: headerParsed.data.periodId,
      formId: headerParsed.data.formId,
      scores: { create: scores },
    },
  });

  return NextResponse.redirect(new URL("/evaluator", req.url));
}
