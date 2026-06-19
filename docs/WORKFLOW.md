# OAS Workflow Guide

## Roles at a Glance

| Role | Also Called | What They Do |
|---|---|---|
| **Admin** | Program Director / Chairman | Sets up the system, prepares evaluations, monitors all results |
| **Evaluator** | Consultant / Attending Physician / Training Officer | Fills out and submits evaluation forms for assigned residents |
| **Resident** | Resident Doctor | Views their own grades and procedure log |

---

## Admin Workflow

The admin owns the full system setup and oversight.

### Setup (done once per program or period)
1. Create an **Evaluation Period** (e.g., "January–June 2025")
2. Create **Evaluation Forms** (e.g., "Rating Scale for Performance in Case Conference")
3. Add **Resident** accounts (with year level: 1st, 2nd, 3rd, or 4th year)
4. Add **Evaluator** accounts (consultants, attendings, training officers)
5. Maintain master lists:
   - **Domains** — categories used in forms (e.g., Knowledge, Technical Skills, Attitude)
   - **Procedures** — medical procedures tracked in procedure logs (In-patient / Out-patient)
   - **Patients** — patient records linked to procedure entries

### Per Evaluation Period
6. Hit **"Prepare Evaluations"** — the system generates pending evaluation tasks and assigns them to evaluators for the active period
7. Monitor the **Evaluations** list — filter by Status (Pending / Draft / Submitted / Archived), Period, or Form
8. If a submitted evaluation needs correction, **revert it to Draft** so the evaluator can edit
9. Once all evaluations are submitted, view the **Grading Sheet** — a consolidated table of all resident scores
10. Export results: **Print PDF** or **Download Excel**

---

## Evaluator Workflow

The evaluator grades residents during an active evaluation period.

1. Log in — the **dashboard** shows all pending evaluation forms assigned to them
2. Open a form — select the resident being evaluated
3. Fill in scores/ratings for each item
4. **Save as Draft** at any point to continue later
5. **Submit** when done — the form is locked and visible to the admin
6. If the admin reverts a submission, edit and re-submit

---

## Resident Workflow

Residents are read-only — they receive evaluations, they don't fill them.

1. Log in — the **dashboard** shows their **Grade Summary** (scores by category for their year level)
2. View **Procedure Monitoring** — a running count of every procedure they've performed, per year level, broken down by In-patient and Out-patient

---

## Evaluation Status Lifecycle

```
Admin hits "Prepare"
        │
        ▼
   [PENDING] ──── Evaluator opens form
        │
        ▼
    [DRAFT] ──── Evaluator saves progress
        │
        ▼
  [SUBMITTED] ──── Evaluator hits Submit
        │
        ├── Admin can revert ──▶ [DRAFT]
        │
        ▼
  [ARCHIVED] ──── Period ends / Admin archives
```

---

## Full End-to-End Flow

```
Admin
 ├─ Create Period
 ├─ Create Forms
 ├─ Add Residents & Evaluators
 └─ Prepare Evaluations
         │
         ▼ (Pending tasks appear in evaluator dashboards)
Evaluators
 ├─ Open pending form
 ├─ Fill scores → Save Draft
 └─ Submit
         │
         ▼ (Submissions visible to admin)
Admin
 ├─ Review Evaluations list
 ├─ Revert to Draft if needed
 ├─ View Grading Sheet (all residents, all scores)
 └─ Export PDF / Excel
         │
         ▼ (Results visible to residents)
Residents
 ├─ View Grade Summary
 └─ View Procedure Log
```

---

## Key Rules

- **Residents never fill forms** — they only view results.
- **Evaluators only see their own assigned forms** — not other evaluators' work or other residents' grades.
- **Only admins see everything** — all evaluations, all grading sheets, all residents.
- **A submitted form is locked** — only an admin can unlock it by reverting to Draft.
- **Procedure logs belong to residents** — each procedure entry is tied to a resident, a procedure type, and a year level.
