import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formDataToStrings } from "@/lib/formData";

const baseSchema = z.object({
  title: z.string().min(1),
  domainId: z.string().optional().nullable(),
});

const questionSchema = z.object({
  label: z.string().min(1),
  maxPoints: z.number().int().min(1).max(100),
  weight: z.number().optional().nullable(),
  questionType: z.string().optional().nullable(),
});

type QuestionInput = z.infer<typeof questionSchema>;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = formDataToStrings(await req.formData());
  const baseParsed = baseSchema.safeParse({
    title: raw.title,
    domainId: raw.domainId === "" ? null : raw.domainId,
  });

  if (!baseParsed.success) return NextResponse.json({ error: "Invalid base input" }, { status: 400 });

  const questions: QuestionInput[] = [];

  for (const i of [0, 1, 2, 3, 4]) {
    const label = raw[`qLabel_${i}`];
    const maxStr = raw[`qMax_${i}`];
    const weightStr = raw[`qWeight_${i}`];
    const questionType = raw[`qType_${i}`];

    if (label && label.trim().length > 0) {
      const maxPoints = Number(maxStr);
      const weight = weightStr ? Number(weightStr) : null;
      const qParsed = questionSchema.safeParse({ 
        label: label.trim(), 
        maxPoints, 
        weight: (weight !== null && !isNaN(weight)) ? weight : null,
        questionType: questionType || "single_select"
      });

      if (!qParsed.success) {
        return NextResponse.json({ error: `Invalid question ${i + 1}: ${qParsed.error.issues[0].message}` }, { status: 400 });
      }
      questions.push(qParsed.data);
    }
  }

  if (questions.length === 0) {
    return NextResponse.json({ error: "Add at least 1 question" }, { status: 400 });
  }

  await prisma.form.create({
    data: {
      title: baseParsed.data.title,
      domainId: baseParsed.data.domainId,
      questions: {
        create: questions.map((q) => ({ 
          label: q.label, 
          maxPoints: q.maxPoints,
          weight: q.weight,
          questionType: q.questionType,
        })),
      },
    },
  });

  return NextResponse.redirect(new URL("/admin/forms", req.url));
}
