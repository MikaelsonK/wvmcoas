# 🔐 Authentication Guard System Documentation

## Overview

We've migrated from Next.js `middleware.ts` to a proper **API-based authentication guard system**. This follows modern Next.js best practices and avoids the deprecated proxy middleware pattern.

---

## 🏗️ Architecture

### Components

| File | Purpose |
|------|---------|
| `src/lib/authGuard.ts` | Core auth guard with JWT session decoding |
| `src/lib/auth.ts` | NextAuth configuration (unchanged) |
| API Routes | Use `getServerSession()` from NextAuth (standard approach) |

### Key Files Created/Updated

1. **`src/lib/authGuard.ts`** - Authentication guard utility
   - Decodes JWT tokens from session cookies
   - Validates user sessions on both client and server
   - Provides typed role checking (`UserRole`)

2. **`src/app/api/admin/evaluations/route.ts`** - Updated example
   - Uses `getServerSession()` (NextAuth standard)
   - Implements proper 401/403 status codes
   - Validates user roles at the API level

---

## 🚀 Usage Guide

### For API Routes

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { UserRole } from "@/lib/authGuard";

export async function POST(req: Request) {
  // Step 1: Get session from NextAuth
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Step 2: Validate user role (RBAC)
  const userRole = session.user.role as UserRole;
  if (userRole !== "ADMIN") {
    return NextResponse.json(
      { error: "Access denied" },
      { status: 403 }
    );
  }

  // Continue with route logic...
}
```

### For Client Components

```typescript
"use client";
import { useSession } from "next-auth/react";

export function ProtectedComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;
  
  if (!session) return <Link href="/login">Login</Link>;

  // Component content for authenticated users
  return <div>Welcome, {session.user.name}!</div>;
}
```

### For Server Components

```typescript
// Inside a Server Component or Route Handler
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getData() {
  const session = await getServerSession(authOptions);
  
  if (!session) throw new Error("Not authenticated");
  
  // Safe to use session.data here
}
```

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

| Route/API | ADMIN | EVALUATOR | RESIDENT | STAFF |
|-----------|-------|-----------|----------|-------|
| `/api/admin/*` | ✅ | ❌ | ❌ | ❌ |
| `/api/evaluations/*` | ✅ | ✅ | ❌ | ❌ |
| `/api/residents/*` | ✅ | ✅ (view only) | ✅ | ✅ |
| `Forms Management` | ✅ | ✅ | ✅ (self-only) | ⚠️ Limited |

---

## 🧪 Testing Checklist

### 1. Test Authentication Flow
```bash
# Start dev server
npm run dev

# Open http://localhost:3000/login
# Login as admin@hospital.com / SecurePass123!
# Verify redirect to dashboard works
```

### 2. Test Role Protection (API)
```bash
# Try creating an evaluation as Resident (should fail with 403)
curl -X POST http://localhost:3000/api/admin/evaluations \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "q_1=5&q_2=4" \
  --user "resident@hospital.com:MyBasicPass789!"
  
# Response should be: {"error":"Access denied. Only EVALUATOR role can perform this action."}
```

### 3. Test Protected Routes (Client-side)
- Visit `/admin` as Resident → Should redirect to login or show restricted message
- Visit `/evaluator` as Resident → Should show "Access Denied" banner

---

## 🔧 Migration Notes

### From Middleware to API Routes

**Before (Deprecated):**
```typescript
// src/middleware.ts ❌
export async function middleware(request) {
  // Complex session checking logic
}
```

**After (Modern):**
```typescript
// src/app/api/admin/*route.ts ✅
import { getServerSession } from "next-auth";

async function GET() {
  const session = await getServerSession(authOptions);
  // Clean, focused auth check
}
```

### Why This Approach?

1. **Separation of Concerns**: Authentication logic lives in API routes where it belongs
2. **Type Safety**: TypeScript types (`UserRole`) provide compile-time checks
3. **Performance**: No unnecessary middleware overhead
4. **Security**: Clear separation between public/private resources

---

## 📝 Important Security Notes

### Session Storage

NextAuth v5 stores sessions in cookies:
- `next-auth.session-token` (secure, httpOnly)
- JWT payload contains user ID, role, email

**Never expose session tokens in frontend code.** Always use `getServerSession()` on the server.

### Rate Limiting

Consider adding rate limiting for login endpoints:

```typescript
import { ratelimit } from "@/lib/ratelimit"; // Use a library like @upstash/ratelimit

export async function POST(req: Request) {
  const limit = await ratelimit.limit(req);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  
  // Continue with auth logic...
}
```

### Password Policies

Current requirements (from `src/lib/password.ts`):
- Minimum length: 6 characters (check `zod` validation)
- Bcrypt hashing (cost factor: 12 rounds)
- Salted for each user

Consider adding these policies in production:
- Maximum password age (e.g., 90 days)
- History (don't allow reuse of last 3 passwords)
- Require special characters/numbers

---

## 🆘 Troubleshooting

### "Session is null" errors

**Cause**: Cookie-based auth requires HTTPS or proper cookie configuration

**Fix**:
```typescript
// In next.config.ts
export default {
  reactCompiler: true,
  serverExternalPackages: ["next-auth"], // Ensure cookies work
};
```

### Role shows as "STAFF" instead of expected role

**Cause**: User exists but wasn't properly seeded

**Fix**:
```bash
npx prisma db seed
```

Or manually update:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@hospital.com';
```

---

## 📚 Next Steps

- ✅ **Completed**: Authentication guard system implemented
- ⏭️ **Next**: Implement API rate limiting (optional but recommended)
- ⏭️ **Next**: Add session refresh logic for long-running applications
- ⏭️ **Next**: Integrate OAuth providers (Google, etc.) if needed

---

## 🔗 Resources

- [NextAuth Official Docs](https://next-auth.js.org/)
- [Next.js API Routes Best Practices](https://nextjs.org/docs/app/building-your-application/routing/router-handlers)
- [JWT Security Considerations](https://owasp.org/www-community/oauth2_pwn#jwt_security_issues)

---

**Last Updated**: 2026-06-19  
**Version**: Authentication Guard v1.0.0
