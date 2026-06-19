import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingForm = await prisma.form.findUnique({
    where: { id },
    include: { questions: true },
  });

  if (!existingForm) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  // Create duplicate form
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

  return NextResponse.redirect(new URL("/admin/forms", req.url));
}
