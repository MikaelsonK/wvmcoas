"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/requireRole";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
  color: z.string().optional().default("#a00707"),
});

export type FormState = {
  errors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
};

export async function createCalendarEvent(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    // Only logged in roles can create events
    await requireRole(["ADMIN", "EVALUATOR", "RESIDENT"]);

    const raw = {
      title: formData.get("title") as string,
      date: formData.get("date") as string,
      startTime: formData.get("startTime") as string | null,
      endTime: formData.get("endTime") as string | null,
      url: formData.get("url") as string | null,
      location: formData.get("location") as string | null,
      details: formData.get("details") as string | null,
      color: formData.get("color") as string | null,
    };

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
      return { errors: parsed.error.flatten().fieldErrors };
    }

    await prisma.calendarEvent.create({
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

    // Revalidate resident dashboard paths
    revalidatePath("/resident");
    revalidatePath("/admin");
    revalidatePath("/evaluator");

    return { success: true };
  } catch (err: any) {
    if (err.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    return { message: err.message || "Failed to create calendar event." };
  }
}
