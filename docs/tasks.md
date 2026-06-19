# Project Task Tracker - OAS (Online Assessment System)

## Project Status Overview
- **Current State**: Initial setup complete, Database Schema Aligned.
- **Next Major Milestone**: Authentication & RBAC.

---

## 📋 Task List

### Phase 1: Foundation & Database (Current)
- [x] Environment Setup (Next.js, TypeScript, Prisma)
- [x] Docker Database Setup (PostgreSQL)
- [x] Initial Database Migration
- [x] Schema Alignment
    - [x] Add `Domain` model (Hierarchical)
    - [x] Add `Procedure` and `ProcedureType` models
    - [x] Refine `Form` and `Question` models with dynamic configurations (weights, points, etc.)
    - [x] Update `User` and `Profile` models for specific roles (Admin, Evaluator, Resident, etc.)
- [x] **Authentication & RBAC**
    - [x] Implement Role-Based Access Control (RBAC)
    - [x] Create Login/Register flow
    - [x] Setup Middleware for protected routes

### Phase 2: System Configuration (Admin Modules)
- [x] **Domain Management**
    - [x] List/Create/Update/Delete Domains
    - [x] Hierarchical parent-child logic
- [x] **Procedure Management**
    - [x] List/Create/Update/Delete Procedures
    - [x] Procedure Type categorization
- [x] **Form Management**
    - [x] Dynamic Form Creation (Questions, Choice types, Weights)
    - [x] Form Duplication functionality
    - [x] Form-to-Domain mapping

### Phase 3: Evaluation & Tracking
- [x] **Evaluations Module**
    - [x] Status tracking (Pending, Draft, Submitted)
    - [x] Revert submitted form to Draft
    - [x] Form submission logic
- [x] **Procedure Monitoring**
    - [x] Procedure completion tracking (e.g., 2/15)
    - [x] Filtering by Year Level and Period
- [x] **User Management**
    - [x] Doctor Profiles (Training Officer, Consultant, Resident)
    - [x] Patient Records (HRN, demographics)

### Phase 4: Reporting & UI (Frontend)
- [x] **Dashboard & Calendar**
    - [x] Full-month calendar grid
    - [x] Event modal with color picker
- [x] **Grade Summary & Grading Sheets**
    - [x] Tabbed year-level summary
    - [x] Complex data tables with raw scores/percentages
    - [x] Export to PDF/Excel (Simulated/Library)
- [x] **Global UI Refinement**
    - [x] Apply Poppins font and Color Palette
    - [x] Sidebar and Header styling

---

## 📝 Notes
- **Primary Colors**: `#a00707` (Red), `#cd9804` (Gold), `#ffffff` (White)
- **Secondary Colors**: `#96bfa4` (Green), `#c52744` (Crimson), `#eab984` (Peach)
- **Database**: PostgreSQL via Docker.
