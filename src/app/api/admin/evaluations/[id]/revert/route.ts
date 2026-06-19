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

  const { searchParams } = new URL(req.url);
  const periodId = searchParams.get("periodId");

  await prisma.evaluation.update({
    where: { id },
    data: { status: "DRAFT" },
  });

  if (periodId) {
    return NextResponse.redirect(new URL(`/admin/grading/${periodId}`, req.url));
  }

  return NextResponse.redirect(new URL("/admin/periods", req.url));
}
