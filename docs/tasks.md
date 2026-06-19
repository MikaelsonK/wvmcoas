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
- [ ] **Authentication & RBAC**
    - [ ] Implement Role-Based Access Control (RBAC)
    - [ ] Create Login/Register flow
    - [ ] Setup Middleware for protected routes

### Phase 2: System Configuration (Admin Modules)
- [ ] **Domain Management**
    - [ ] List/Create/Update/Delete Domains
    - [ ] Hierarchical parent-child logic
- [ ] **Procedure Management**
    - [ ] List/Create/Update/Delete Procedures
    - [ ] Procedure Type categorization
- [ ] **Form Management**
    - [ ] Dynamic Form Creation (Questions, Choice types, Weights)
    - [ ] Form Duplication functionality
    - [ ] Form-to-Domain mapping

### Phase 3: Evaluation & Tracking
- [ ] **Evaluations Module**
    - [ ] Status tracking (Pending, Draft, Submitted)
    - [ ] Revert submitted form to Draft
    - [ ] Form submission logic
- [ ] **Procedure Monitoring**
    - [ ] Procedure completion tracking (e.g., 2/15)
    - [ ] Filtering by Year Level and Period
- [ ] **User Management**
    - [ ] Doctor Profiles (Training Officer, Consultant, Resident)
    - [ ] Patient Records (HRN, demographics)

### Phase 4: Reporting & UI (Frontend)
- [ ] **Dashboard & Calendar**
    - [ ] Full-month calendar grid
    - [ ] Event modal with color picker
- [ ] **Grade Summary & Grading Sheets**
    - [ ] Tabbed year-level summary
    - [ ] Complex data tables with raw scores/percentages
    - [ ] Export to PDF/Excel (Simulated/Library)
- [ ] **Global UI Refinement**
    - [ ] Apply Poppins font and Color Palette
    - [ ] Sidebar and Header styling

---

## 📝 Notes
- **Primary Colors**: `#a00707` (Red), `#cd9804` (Gold), `#ffffff` (White)
- **Secondary Colors**: `#96bfa4` (Green), `#c52744` (Crimson), `#eab984` (Peach)
- **Database**: PostgreSQL via Docker.
