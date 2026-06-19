# 🔐 Authentication & RBAC Testing Guide

This document covers how to test the authentication and Role-Based Access Control (RBAC) functionality for the OAS system.

---

## 🧪 Prerequisites

Before testing, ensure:

1. ✅ Test accounts have been seeded (run `npx prisma db seed`)
2. ✅ Development server is running (`npm run dev` or similar)
3. ✅ Database connection is active

---

## 👥 Seeded Test Accounts

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **ADMIN** | `admin@hospital.com` | `SecurePass123!` | Full system control, user management, domain settings |
| **EVALUATOR** | `evaluator@hospital.com` | `ReviewPass456!` | Can manage assessments and reports |
| **RESIDENT** | `resident@hospital.com` | `MyBasicPass789!` | Standard user for form interactions |

---

## 🚀 Testing Checklist

### ✅ Login/Signup Flow
- [ ] Navigate to `/login` page
- [ ] Enter any test account credentials
- [ ] Verify redirect happens after successful login
- [ ] Test signup page (`/signup`) creates new accounts (if not already seeded)
- [ ] Error messages appear correctly for invalid credentials

### ✅ Role-Based Dashboard Access
After logging in, verify you land on the appropriate dashboard:

**ADMIN:**
- [ ] See full system management interface
- [ ] Can access domain management, user settings, etc.

**EVALUATOR:**
- [ ] Can view/manage procedure evaluations
- [ ] Cannot access admin-only routes (e.g., `/admin`)

**RESIDENT:**
- [ ] Can view own evaluations
- [ ] Restricted from creating domains or managing users

### ✅ Route Protection Tests
Try accessing restricted routes:

| URL | ADMIN | EVALUATOR | RESIDENT | Expected Behavior |
|-----|-------|-----------|----------|-------------------|
| `/admin` | ✅ Access Granted | ❌ Redirected | ❌ Redirected | Role enforcement |
| `/api/admin/*` | ✅ Allowed | ❌ Blocked | ❌ Blocked | API-level RBAC |

### ✅ API Authentication
Test protected API endpoints:

```bash
# As Admin (should work)
curl -X POST http://localhost:3000/api/evaluations \
  -H "Authorization: Bearer <admin-session-token>" \
  -d '{"procedureId": "..."}'

# As Resident (should fail for admin routes)
curl -X GET http://localhost:3000/api/admin/residents \
  -H "Authorization: Bearer <resident-session-token>"
```

---

## 🎯 What to Watch For

**✅ Success Indicators:**
- Login redirects work seamlessly
- Session persists across page reloads
- Dashboard content matches user role
- Error messages are clear and helpful

**❌ Potential Issues:**
- Redirect loops during login
- Wrong dashboard shown after login
- Middleware blocks legitimate routes
- API returns 401/403 for authenticated users

---

## 🐛 Debug Mode (Development Only)

To see middleware logs:

```bash
# Enable verbose logging in your env file
DEBUG=next-auth:* npm run dev
```

Look for messages like:
```
[Middleware] Session retrieved: user.role = ADMIN
[RBAC] Unauthorized access attempt to /admin by user role: RESIDENT
```

---

## 📝 Quick Test Commands

### 1. Verify seeding worked:
```bash
npx prisma db seed --help # Check if seed script is loaded
# OR check your database directly:
psql -U postgres -d your-db-name -c "SELECT email, role FROM 'user' WHERE email = 'admin@hospital.com';"
```

### 2. Run Playwright tests (if configured):
```bash
npx playwright test --project=chromium __tests__/login_auth.spec.ts
```

### 3. Test API authentication manually:
```bash
# Login endpoint (returns session)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@hospital.com", "password": "SecurePass123!"}'
```

---

## 🔒 Security Notes

**⚠️ Important:** After testing, consider:
- Changing default test passwords in production
- Enabling rate limiting on login endpoints
- Adding 2FA for admin accounts
- Reviewing session timeout settings

---

## 📊 Test Account Reset

If you need to reset accounts (e.g., after failed password attempts):

```bash
npx prisma db seed
```

Or manually update roles in database:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'evaluator@hospital.com';
```

---

**Need Help?** Check the [Task Tracker](./tasks.md) for remaining phases.
