import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { UserRole } from "@/lib/authGuard";
import { formDataToStrings } from "@/lib/formData";

const headerSchema = z.object({
  residentId: z.string().min(1),
  periodId: z.string().min(1),
  formId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in first." },
      { status: 401 }
    );
  }

  const userRole = session.user.role as UserRole;
  
  // Only evaluators can create evaluations
  if (userRole !== "EVALUATOR") {
    return NextResponse.json(
      { error: `Access denied. Only EVALUATOR role can perform this action.` },
      { status: 403 }
    );
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

  const status = (raw.status === "SUBMITTED" || raw.status === "PENDING" || raw.status === "DRAFT") 
    ? raw.status 
    : "DRAFT";

  const evaluationId = raw.evaluationId;

  if (evaluationId) {
    const existing = await prisma.evaluation.findUnique({ where: { id: evaluationId } });
    if (!existing) return NextResponse.json({ error: "Evaluation not found" }, { status: 404 });
    if (existing.evaluatorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: You are not the evaluator of this record" }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.score.deleteMany({ where: { evaluationId } }),
      prisma.evaluation.update({
        where: { id: evaluationId },
        data: {
          status: status,
          scores: { create: scores },
        },
      }),
    ]);
  } else {
    await prisma.evaluation.create({
      data: {
        evaluatorId: session.user.id,
        residentId: headerParsed.data.residentId,
        periodId: headerParsed.data.periodId,
        formId: headerParsed.data.formId,
        status: status,
        scores: { create: scores },
      },
    });
  }

  return NextResponse.redirect(new URL("/evaluator", req.url));
}
