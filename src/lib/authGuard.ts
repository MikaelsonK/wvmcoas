/**
 * Authentication Guard for protecting routes and API endpoints
 * Uses the NextAuth session to verify user authentication and role
 */

export type UserRole = "ADMIN" | "EVALUATOR" | "RESIDENT" | "STAFF";

export interface AuthGuardResult {
  isAuthenticated: boolean;
  user?: {
    email: string;
    name: string;
    role: UserRole;
  } | null;
  redirectUrl?: string;
  error?: string;
}

/**
 * Checks if the current request is authenticated and returns user info
 * Should be used in API routes and server components
 */
export async function checkAuth(): Promise<AuthGuardResult> {
  try {
    // Get session from NextAuth context (in API route or server component)
    // This uses your existing authOptions from @/lib/auth
    
    // For NextAuth v5 with JWT strategy, session comes from cookies
    const sessionCookie = cookies().get('next-auth.session-token')?.value;
    
    if (!sessionCookie) {
      return {
        isAuthenticated: false,
        error: 'No active session found',
      };
    }

    // Decode JWT token to get user info
    const decodedToken = decodeJwt(sessionCookie);

    if (!decodedToken) {
      return {
        isAuthenticated: false,
        error: 'Invalid session token',
      };
    }

    const { userId, email, name, role } = decodedToken;

    if (!userId || !email) {
      return {
        isAuthenticated: false,
        error: 'Invalid user data in session',
      };
    }

    return {
      isAuthenticated: true,
      user: {
        email,
        name,
        role: role as UserRole,
      },
    };
  } catch (error) {
    console.error('[AuthGuard] Authentication check failed:', error);
    return {
      isAuthenticated: false,
      error: 'Authentication error',
    };
  }
}

/**
 * Decodes JWT token from session cookie
 */
function decodeJwt(token: string): any {
  try {
    // Remove prefix if it exists (e.g., "Bearer ")
    const cleanToken = token.replace(/^[Bb]earer\s*/, '');
    
    // Add padding if needed for base64 decoding
    let paddedToken = cleanToken;
    while (paddedToken.length % 4 !== 0) {
      paddedToken += '=';
    }

    // Decode the JWT payload (second part of the token)
    const parts = cleanToken.split('.');
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode and parse JSON
    const decoded = JSON.parse(atob(base64));
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Helper to redirect users if not authenticated
 */
export function requireAuth(redirectUrl: string): void {
  // This should be called before protected route execution
  const authResult = checkAuth();
  
  if (!authResult.isAuthenticated) {
    window.location.href = `${window.location.origin}${redirectUrl}`;
    throw new Error(`Redirecting to ${redirectUrl}`);
  }
}
