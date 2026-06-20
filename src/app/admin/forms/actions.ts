"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/requireRole";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1, "Form title is required"),
  domainId: z.string().optional().nullable(),
  questions: z.array(z.object({
    label: z.string().min(1, "Question label is required"),
    maxPoints: z.coerce.number().int().min(1, "Max points must be at least 1").max(100, "Max points must be at most 100"),
    weight: z.coerce.number().optional().nullable(),
    questionType: z.string().default("single_select"),
  })).min(1, "At least one question is required"),
});

export type FormState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
};

export async function createForm(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await requireRole(["ADMIN"]);

    const title = formData.get("title") as string;
    const domainId = formData.get("domainId") as string;

    const questionsInput: { label: string; maxPoints: number; weight: number | null; questionType: string }[] = [];

    for (const i of [0, 1, 2, 3, 4]) {
      const label = formData.get(`qLabel_${i}`) as string | null;
      const maxStr = formData.get(`qMax_${i}`) as string | null;
      const weightStr = formData.get(`qWeight_${i}`) as string | null;
      const questionType = formData.get(`qType_${i}`) as string | null;

      if (label && label.trim().length > 0) {
        questionsInput.push({
          label: label.trim(),
          maxPoints: maxStr ? Number(maxStr) : NaN,
          weight: weightStr && weightStr.trim() !== "" ? Number(weightStr) : null,
          questionType: questionType || "single_select",
        });
      }
    }

    const raw = {
      title,
      domainId: domainId === "" ? null : domainId,
      questions: questionsInput,
    };

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      // Return errors. Note: nested field errors in zod will look like "questions.0.label"
      // React Aria supports these dot-notation paths as keys in validationErrors!
      const errorMap: Record<string, string[]> = {};
      const flatErrors = parsed.error.flatten();
      
      // Copy root fields
      Object.assign(errorMap, flatErrors.fieldErrors);
      
      // Map nested questions errors to individual form fields
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0] === "questions") {
          const idx = String(issue.path[1]);
          const field = String(issue.path[2]);
          // E.g. qLabel_0, qMax_0, etc.
          let fieldName = "";
          if (field === "label") fieldName = `qLabel_${idx}`;
          else if (field === "maxPoints") fieldName = `qMax_${idx}`;
          else if (field === "weight") fieldName = `qWeight_${idx}`;
          
          if (fieldName) {
            errorMap[fieldName] = [issue.message];
          }
        }
      });

      return { errors: errorMap };
    }

    const { title: finalTitle, domainId: finalDomainId, questions: finalQuestions } = parsed.data;

    await prisma.form.create({
      data: {
        title: finalTitle.trim(),
        domainId: finalDomainId,
        questions: {
          create: finalQuestions,
        },
      },
    });

    revalidatePath("/admin/forms");
    revalidatePath("/admin/curriculum");
    return { success: true };
  } catch (err) {
    const error = err as Error & { digest?: string };
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return { message: error.message || "Something went wrong." };
  }
}

export async function duplicateForm(id: string): Promise<void> {
  await requireRole(["ADMIN"]);

  const existingForm = await prisma.form.findUnique({
    where: { id },
    include: { questions: true },
  });

  if (!existingForm) {
    throw new Error("Form not found");
  }

  await prisma.form.create({
    data: {
      title: `Copy of ${existingForm.title}`,
      domainId: existingForm.domainId,
      questions: {
        create: existingForm.questions.map((q) => ({
          label: q.label,
          maxPoints: q.maxPoints,
          weight: q.weight,
          questionType: q.questionType,
        })),
      },
    },
  });

  revalidatePath("/admin/forms");
  revalidatePath("/admin/curriculum");
}
