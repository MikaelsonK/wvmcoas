import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";

export async function requireRole(allowed: Role[]): Promise<{ userId: string; role: Role }> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  const userId = session.user.id;

  const ok = allowed.includes(role);
  if (!ok) redirect("/");

  return { userId, role };
}
