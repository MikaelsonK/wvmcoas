import { test, expect } from '@playwright/test';

// --- Global Constants for Testing ---
const ADMIN_EMAIL = 'admin@hospital.com';
const EVALUATOR_EMAIL = 'evaluator@hospital.com';
const RESIDENT_EMAIL = 'resident@hospital.com';

const ADMIN_PASSWORD = 'SecurePass123!';
const EVALUATOR_PASSWORD = 'ReviewPass456!';
const RESIDENT_PASSWORD = 'MyBasicPass789!';

// --- Test Suite Definition ---

test.describe('Authentication and Authorization Flow Tests (RBAC)', () => {
  /*
   * NOTE: These tests assume that the database has been seeded 
   * using npx prisma db seed, and that the application is running locally 
   * (e.g., `npm run dev` or similar) for API calls to succeed.
   */

  test('1. Successful login for ADMIN user', async ({ page }) => {
    await test.goto('/login');
    await test.fill('input[name="email"]', ADMIN_EMAIL);
    await test.fill('input[name="password"]', ADMIN_PASSWORD);
    await test.click('button[type="submit"]');

    // Wait for redirect and check for admin-specific content
    await test.waitForURL(/dashboard/); 
    await expect(page.locator('h1')).toContainText('Admin Dashboard'); // Adjust selector
    await expect(page).toHaveCSS('.admin-panel-element', 'display: block'); // Test for an Admin-only UI element
  });

  test('2. Successful login for EVALUATOR user', async ({ page }) => {
    await test.goto('/login');
    await test.fill('input[name="email"]', EVALUATOR_EMAIL);
    await test.fill('input[name="password"]', EVALUATOR_PASSWORD);
    await test.click('button[type="submit"]');

    // Wait for redirect and check for evaluator-specific content
    await test.waitForURL(/dashboard/);
    await expect(page.locator('h1')).toContainText('Evaluator Dashboard'); // Adjust selector
  });

  test('3. Successful login and restricted access attempt for RESIDENT user', async ({ page }) => {
    // Step 1: Login as Resident
    await test.goto('/login');
    await test.fill('input[name="email"]', RESIDENT_EMAIL);
    await test.fill('input[name="password"]', RESIDENT_PASSWORD);
    await test.click('button[type="submit"]');

    // Step 2: Verify role-specific dashboard view
    await test.waitForURL(/dashboard/);
    await expect(page.locator('h1')).toContainText('Resident Dashboard'); // Adjust selector

    // Step 3: Test RBAC Enforcement (Access Attempt)
    // Assume '/admin/domains' is a route protected by the Admin role
    await test.goto('/admin/domains');
    
    // We expect that because of the RoleGate middleware, we are blocked from viewing the page content.
    const accessDeniedMessage = 'Access Denied: You do not have the necessary permissions.'; 
    await test.waitForTimeout(100); // Give time for roleGuard to render

    await test.locator('div').getByText(accessDeniedMessage).toBeVisible();
  });


  test('4. Test invalid credentials', async ({ page }) => {
    // Attempt to log in with incorrect password
    await test.goto('/login');
    await test.fill('input[name="email"]', 'nonexistent@hospital.com');
    await test.fill('input[name="password"]', 'WrongPassword');
    await test.click('button[type="submit"]');

    // Verify the login form still shows an error message for bad credentials
    const errorMessage = /Invalid email or password/; // Use regex to catch general error
    await expect(page).getByText(errorMessage).toBeVisible(); 
  });
});