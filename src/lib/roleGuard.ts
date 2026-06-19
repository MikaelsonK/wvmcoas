import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export type UserRole = "ADMIN" | "EVALUATOR" | "RESIDENT" | "STAFF";

/**
 * Checks if the current user has a role that meets or exceeds the minimum required permission level.
 * @param requiredRole The minimum role required to access the resource (e.g., "ADMIN").
 * @returns A Promise<boolean> that resolves to true if the user is authorized, false otherwise.
 */
export async function hasPermission(requiredRole: UserRole): Promise<boolean> {
  // Retrieve the current session data for the user on the client or server side
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.role) {
    console.warn("Authorization failed: No active session or role found.");
    return false; // Not logged in
  }

  const userRole = session.user.role as UserRole;

  // Simple hierarchy check
  switch (requiredRole) {
    case "ADMIN":
      // Only ADMIN can perform this action.
      return userRole === "ADMIN";
    case "EVALUATOR":
      // Admin OR Evaluator can do this.
      return userRole === "ADMIN" || userRole === "EVALUATOR";
    case "RESIDENT":
      // Everyone with a defined role can view basic info
      return true;
    case "STAFF":
      return userRole === "STAFF";
  }

  // Fallback check: If we reached here and the roles match exactly:
  return userRole === requiredRole;
}