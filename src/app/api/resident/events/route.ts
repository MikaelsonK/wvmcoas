import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formDataToStrings } from "@/lib/formData";

const schema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
  color: z.string().optional().default("#a00707"),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await prisma.calendarEvent.findMany({
    orderBy: { date: "asc" },
  });

  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = formDataToStrings(await req.formData());
  const parsed = schema.safeParse({
    title: raw.title,
    date: raw.date,
    startTime: raw.startTime === "" ? null : raw.startTime,
    endTime: raw.endTime === "" ? null : raw.endTime,
    url: raw.url === "" ? null : raw.url,
    location: raw.location === "" ? null : raw.location,
    details: raw.details === "" ? null : raw.details,
    color: raw.color || "#a00707",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: `Invalid input: ${parsed.error.issues[0].message}` }, { status: 400 });
  }

  const newEvent = await prisma.calendarEvent.create({
    data: {
      title: parsed.data.title,
      date: new Date(parsed.data.date),
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      url: parsed.data.url,
      location: parsed.data.location,
      details: parsed.data.details,
      color: parsed.data.color,
    },
  });

  // Redirect back to dashboard based on role
  const dashboardUrl = session.user.role === "ADMIN" ? "/admin" : session.user.role === "EVALUATOR" ? "/evaluator" : "/resident";
  return NextResponse.redirect(new URL(dashboardUrl, req.url));
}
