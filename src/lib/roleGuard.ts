/**
 * @fileoverview Role-Based Access Control (RBAC) utility guards.
 * This module enforces user permissions based on their role retrieved from the session.
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
// Assuming 'Role' type is defined or available globally, matching what we stored in auth.ts
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

  // Simple hierarchy check (can be expanded later with complex matrix)
  switch (requiredRole) {
    case "ADMIN":
      // Only ADMIN can perform this action.
      return userRole === "ADMIN";
    case "EVALUATOR":
      // Admin OR Evaluator can do this.
      return userRole === "ADMIN" || userRole === "EVALUATOR";
    case "RESIDENT":
      // Everyone with a defined role can view basic info, but maybe only ADMIN/EVALUATOR can modify the setup.
      return true; // Assume viewing is generally allowed for now.
    case "STAFF":
      // Staff has limited access, usually handled by specific endpoints.
      if (requiredRole === "STAFF") return userRole === "STAFF";
  }

  // Fallback check: If we reached here and the roles match exactly:
  return userRole === requiredRole;
}

/**
 * Component Wrapper to restrict rendering based on role.
 * Use this in your components' render logic.
 * @param {React.ComponentType} Component The component to wrap.
 * @param {UserRole} allowedRoles A tuple of roles that are permitted to view the content.
 */
export function RoleGate<Component>(allowedRoles: UserRole[]): React.FC<{ children: React.ReactNode }> {
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        // This implementation would ideally use a context/hook to read the session role reliably on the client side
        // For demonstration purposes, we'll assume an API call or hook provides the user role.
        // In a real app, you might wrap this in a ClientComponent and use 'useSession()' hook.
        console.log("RoleGate needs integration with your specific session context/hook.");
    }, []);

    if (!hasPermission) {
        return <div className="p-4 bg-red-100 text-red-700 border border-red-300">Access Denied: You do not have the necessary permissions.</div>;
    }
    
    return <>{children}</>;
}