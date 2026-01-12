import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formDataToStrings } from "@/lib/formData";

const schema = z.object({
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
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Invalid selection" }, { status: 400 });

  const url = new URL("/evaluator/new/fill", req.url);
  url.searchParams.set("residentId", parsed.data.residentId);
  url.searchParams.set("periodId", parsed.data.periodId);
  url.searchParams.set("formId", parsed.data.formId);

  return NextResponse.redirect(url);
}
