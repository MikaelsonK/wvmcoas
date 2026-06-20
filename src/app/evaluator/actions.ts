"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/requireRole";
import { redirect } from "next/navigation";

export type FormState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
};

export async function submitEvaluation(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  let targetUrl = "";
  try {
    const { userId } = await requireRole(["EVALUATOR"]);

    const residentId = formData.get("residentId") as string;
    const periodId = formData.get("periodId") as string;
    const formId = formData.get("formId") as string;
    const evaluationId = formData.get("evaluationId") as string | null;
    const statusRaw = formData.get("status") as string | null;

    if (!residentId || !periodId || !formId) {
      return { message: "Header details are missing." };
    }

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { questions: true },
    });
    if (!form) {
      return { message: "Evaluation form not found." };
    }

    const errors: Record<string, string[]> = {};
    const scores: { questionId: string; points: number }[] = [];

    for (const q of form.questions) {
      const key = `q_${q.id}`;
      const v = formData.get(key) as string | null;
      if (!v || v.trim() === "") {
        errors[key] = ["Score is required"];
        continue;
      }

      const points = Number(v);
      if (isNaN(points) || !Number.isInteger(points) || points < 0 || points > q.maxPoints) {
        errors[key] = [`Must be an integer between 0 and ${q.maxPoints}`];
        continue;
      }

      scores.push({ questionId: q.id, points });
    }

    if (Object.keys(errors).length > 0) {
      return { errors };
    }

    const status = (statusRaw === "SUBMITTED" || statusRaw === "PENDING" || statusRaw === "DRAFT")
      ? statusRaw
      : "DRAFT";

    if (evaluationId && evaluationId.trim() !== "") {
      const existing = await prisma.evaluation.findUnique({ where: { id: evaluationId } });
      if (!existing) {
        return { message: "Draft evaluation not found." };
      }
      if (existing.evaluatorId !== userId) {
        return { message: "Forbidden: You are not the evaluator of this record." };
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
          evaluatorId: userId,
          residentId,
          periodId,
          formId,
          status,
          scores: { create: scores },
        },
      });
    }

    revalidatePath("/evaluator");
    targetUrl = "/evaluator";
  } catch (err: any) {
    if (err.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    return { message: err.message || "Failed to process evaluation." };
  }

  if (targetUrl) {
    redirect(targetUrl);
  }
  return { success: true };
}
