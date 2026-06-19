# 🔑 Project Seeding & Test Account Setup

This document outlines how to initialize or reset the system with defined test user accounts, ensuring that all core roles (Admin, Evaluator, Resident) are present for development and QA testing.

## 🎯 Objective
To provide predictable, reproducible test data for authentication (AuthN) and authorization (AuthZ) testing.

## 📋 Prerequisites
1.  **Prisma Setup**: Ensure your `prisma` directory is configured correctly in the project root.
2.  **Password Hashing Utility**: The seed script relies on a functional `verifyPassword` utility found at `@/lib/password` to securely hash plain-text passwords before insertion into the database.
3.  **Environment Variables**: Ensure your `.env` file is loaded and contains necessary keys (e.g., database connection URI).

## 🚀 How To Seed Accounts

The seeding process must be run using Prisma's native seed command, which executes the logic defined in `prisma/seed.ts`.

**1. Run the Seed Command:**
```bash
npx prisma db seed 
```

This command will:
*   Read and execute the functions within `prisma/seed.ts`.
*   Iterate through the defined test users (`admin`, `evaluator`, `resident`).
*   For each user, it hashes the plain-text password using the secure hashing utility.
*   It uses an `upsert` operation to either create the user if they don't exist or securely update their credentials and roles if they already do.

## 👤 Default Test Credentials

| Role | Email Address | Plain Password | Purpose |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@hospital.com` | `SecurePass123!` | Full control over system configuration, user roles, and core data models (Domains, Procedures). |
| **EVALUATOR** | `evaluator@hospital.com` | `ReviewPass456!` | Can manage assessments, view performance reports, but cannot modify global system structures or user accounts. |
| **RESIDENT** | `resident@hospital.com` | `MyBasicPass789!` | Represents the typical end-user role who primarily interacts with forms and tracking within a specific domain. |

***⚠️ Security Warning: Please change these default passwords immediately after testing to secure production data!***