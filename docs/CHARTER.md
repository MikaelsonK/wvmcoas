# Project Charter — Online Assessment System (OAS)

## Overview

The **Online Assessment System (OAS)** is a web-based medical education platform for hospital residency programs. It digitizes the evaluation of resident doctors by attending physicians and consultants, consolidates scores into grading sheets, and tracks procedural competency across all training years.


---

## Problem Statement

Residency programs in hospitals rely on paper-based evaluations and manual grade consolidation — a process that is slow, error-prone, and difficult to audit. Program directors lack a real-time view of resident performance, and residents have no self-service access to their own grades or procedure logs.

---

## Goals

1. Digitize and automate the resident evaluation workflow end-to-end.
2. Consolidate evaluation scores into a grading sheet per resident per evaluation period.
3. Track cumulative procedure counts across all 4 training years.
4. Allow administrators to configure dynamic assessment forms without code changes.
5. Support role-based access so residents, evaluators, and admins each see only what they need.

---

## User Roles

| Role | Also Called | Responsibilities |
|---|---|---|
| **Admin** | Program Director / Chairman | Manage users, forms, periods, domains, procedures. View all grading sheets. |
| **Evaluator** | Consultant / Training Officer / Attending Physician | Fill out evaluation forms for assigned residents. |
| **Resident** | Resident Doctor | View own grades, evaluation forms, and procedure log. |

---

## Core Features

### 1. Dashboard
- **Admin/Evaluator:** Downloadable blank evaluation forms; Event Calendar with add/edit events.
- **Resident:** Grade Summary by year level (Quizzes, Long Exams, Oral Exam, OSCE, RISE, Clinical Competence, etc.).

### 2. Evaluation Forms (User Ratings)
- Evaluators see a list of pending evaluation forms assigned to them.
- Each form shows: form name, subject (resident), status, submitted date, graded date.
- Evaluator opens a form, selects the resident, and fills scores.
- Status lifecycle: **Pending → Draft → Submitted** (Admin can revert Submitted → Draft).

### 3. Procedure Monitoring
- Per-resident view of medical procedures across 4 training years.
- Two tabs: **In-patient** and **Out-patient**.
- Shows procedure name, count per year, and date last performed.

### 4. Evaluations (Admin)
- Admin list of all evaluations across all residents.
- Filter by: Status (Pending, Draft, Submitted, Archived), Evaluation Period, Evaluation Form.
- Bulk "prepare" action to generate pending evaluations for a period.

### 5. Grading Sheet (Admin)
- Consolidated grade table per evaluation period and year level.
- Columns: Name, Quizzes (Raw/%), Long Exams (Raw/%), Oral Exam (Raw/%), OSCE, RISE, Clinical Competence, Performance in Conference, Ultrasound, WED.
- Actions: View summary per resident, Print PDF, Download Excel.
- Filter by Year Level and Evaluation Period.

### 6. Procedure Summary (Admin)
- Aggregate procedure counts across all residents.
- Filter by Year Level and Evaluation Period.
- Columns: Procedure name, counts per year (First / Second / Third / Fourth), last performed date.
- Print PDF per resident.

### 7. Residents / Doctors Management (Admin)
- Fields: License No., Name, Email, Contact No., Role (Training Officer, Resident Doctor, Graduate).
- Paginated table with search, edit, and archive actions.

### 8. Patients Management (Admin)
- Fields: MRN (Medical Record No.), Name, Age, Gender, Civil Status, Email.
- Patients linked to procedure records.

### 9. Evaluation Forms Builder (Admin)
- Create forms with configurable items.
- Features:
  - Duplicate form
  - Configurable choice weights / point values
  - Single-select and multi-select question types
  - Multi-level (nested) form items
- Table view: Name, Min, Hr, Day, Month, Week columns, Evaluator type, Subject type.

### 10. Domains Management (Admin)
- Hierarchical domain taxonomy (e.g., Knowledge > Written Exam > Clinical Competence).
- Fields: Name, Parent Domain.
- Used to categorize form questions.

### 11. Procedures Management (Admin)
- Master list of medical procedures.
- Fields: Name, Procedure Type (In-patient / Out-patient).
- Used to populate Procedure Monitoring and Procedure Summary.

---

## What the Current MVP Has Built

| Feature | Status |
|---|---|
| Authentication (login, session, role guard) | Done |
| User management (Admin, Evaluator, Resident) | Done |
| Evaluation Periods | Done |
| Forms with questions (point-based scoring) | Done — basic (no builder UI, no weights/nesting) |
| Evaluations (create, fill, submit) | Done — basic |
| Admin: manage evaluators & residents | Done |
| Admin: grading view per period | Done — basic |
| Resident dashboard | Stub |
| Procedure Monitoring | Not started |
| Grading Sheet with full column breakdown | Not started |
| Procedure Summary | Not started |
| Domains | Not started |
| Procedures master list | Not started |
| Patients | Not started |
| Evaluation status workflow (revert to Draft) | Not started |
| PDF / Excel export | Not started |
| Event Calendar | Not started |
| Form builder (weights, nesting, duplicate) | Not started |

---

## Data Model (Current)

```
User (ADMIN | EVALUATOR | RESIDENT)
  └─ ResidentProfile (yearLevel)
  └─ EvaluatorProfile

Period (name, startDate, endDate)

Form
  └─ Question (label, maxPoints)

Evaluation (evaluator → resident, period, form)
  └─ Score (question, points)
```

**Gaps vs. original system:** Domains, Procedures, ProcedureLog, Patients, evaluation status enum, form question types/weights, nested questions.

---

## Suggested Next Steps (Priority Order)

1. **Evaluation status workflow** — add `status` field (PENDING / DRAFT / SUBMITTED) to `Evaluation`; add revert-to-draft action.
2. **Resident profile expansion** — add License No., year level 1–4 to `ResidentProfile`.
3. **Domains & Procedures** — add `Domain` and `Procedure` models; seed with OB-GYN defaults.
4. **Procedure Monitoring** — per-resident procedure log with year and in/out-patient type.
5. **Full Grading Sheet** — define evaluation categories (Quizzes, Long Exams, etc.) and map forms to them.
6. **Form builder UI** — weights, question types, nesting, duplicate.
7. **Procedure Summary page** — aggregate view for admin.
8. **PDF/Excel export** — grading sheet and procedure monitoring.
9. **Patients module** — MRN, demographics, link to procedures.
10. **Event Calendar** — simple calendar on dashboard.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Auth | NextAuth v4 |
| ORM | Prisma |
| Database | PostgreSQL |
| Language | TypeScript |
| Styling | (TBD — currently globals.css only) |

---

