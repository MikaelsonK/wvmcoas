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
  const action = searchParams.get("action");
  const item = searchParams.get("item"); // "procedure" or "type"

  if (action === "delete") {
    if (item === "type") {
      await prisma.procedureType.delete({
        where: { id },
      });
    } else {
      await prisma.procedure.delete({
        where: { id },
      });
    }
    return NextResponse.redirect(new URL("/admin/procedures", req.url));
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
