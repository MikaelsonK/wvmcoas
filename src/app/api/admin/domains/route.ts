import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formDataToStrings } from "@/lib/formData";

const schema = z.object({
  name: z.string().min(1),
  parentId: z.string().optional().nullable(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const domains = await prisma.domain.findMany({
    include: {
      parent: true,
      children: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(domains);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = formDataToStrings(await req.formData());
  const parsed = schema.safeParse({
    name: raw.name,
    parentId: raw.parentId === "" ? null : raw.parentId,
  });

  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const domain = await prisma.domain.create({
    data: {
      name: parsed.data.name,
      parentId: parsed.data.parentId,
    },
  });

  return NextResponse.redirect(new URL("/admin/domains", req.url));
}
