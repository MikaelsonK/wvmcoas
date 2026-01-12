import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export const ROLES = ["ADMIN", "EVALUATOR", "RESIDENT"] as const;
export type Role = (typeof ROLES)[number];

function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export async function requireRole(allowed: Role[]): Promise<{ userId: string; role: Role }> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const roleRaw = session.user.role;

  if (typeof roleRaw !== "string" || !isRole(roleRaw)) {
    redirect("/login");
  }

  const role: Role = roleRaw;

  if (!allowed.includes(role)) redirect("/");

  return { userId, role };
}
