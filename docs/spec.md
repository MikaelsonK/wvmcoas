# Online Assessment System (OAS) - Specification Document

## 1. System Overview
The Online Assessment System (OAS) is designed to streamline evaluations and monitoring for medical residency programs (specifically OBGYNE). It replaces paper-based assessments with a digital platform to enhance medical education, improve efficiency, and provide data-driven insights into residency program quality.

## 2. User Roles & Permissions
- **Admin:** Full access to system configuration, user management, and reports.
- **Evaluator (Attending Physicians, Supervisors):** Can view and submit evaluations for residents.
- **Resident:** Can view their own evaluations and performance summaries.
- **Other Roles:** Depending on configuration, roles can be assigned to various staff types.

## 3. Design Specifications

### Typography
- **Primary Font:** Poppins
- **Default Text Color:** #242424 (Dark Gray)

### Color Palette
- **Primary Colors:**
  - Deep Red: `#a00707`
  - Golden Yellow: `#cd9804`
  - White: `#ffffff`
- **Secondary Colors:**
  - Muted Green: `#96bfa4`
  - Muted Crimson/Rose: `#c52744`
  - Peach/Tan: `#eab984`

### UI Layout
- **Top Header:** Logo (left), User Profile/Avatar (right).
- **Left Sidebar Navigation:** Dark-themed sidebar with two main sections:
  - **Features:** Dashboard, Ratings, Procedure Count, Evaluations, Grading Sheet, Procedure Summary, Doctors, Patients.
  - **SYSTEM:** Forms, Domains, Domain Config, Procedure Types, Procedures.
- **Main Content Area:** Light-themed area with breadcrumb navigation and paginated data tables with search/action features.

## 4. Module Details

### Dashboard & Event Calendar
- **Main View:** Full-month calendar grid.
- **Side Panel:** List of "Downloadable Blank Forms".
- **Add Event Modal:** Fields for Title, Date, Start/End Time, URL, Location, Details, and Color Picker.

### User Ratings
- **List View:** Table showing Evaluation Form Name, Status, Submitted Date, Evaluated By, Updated Date, and Actions.
- **Detail View:** Specific rating form details including Evaluator information.

### Grade Summary & Grading Sheet
- **Features:** Filter by Year Level and Evaluation Period. Print (PDF) and Download (Excel) capabilities.
- **Grade Summary:** Tabbed interface for Year Levels (e.g., First Year, Second Year) showing raw scores and percentages for various exams (Quizzes, Long Exams, Oral Exam, OSCE, RISE, Clinical Competence).
- **Grading Sheet:** Detailed breakdown table for residents showing scores across multiple exam types.

### Evaluations
- **Features:** Filter by Status (Pending, Draft, Submitted), Period, and Form. Ability to revert submitted forms to Draft.
- **View:** Sub-navigation tabs for Statuses.

### Procedure Monitoring & Summary
- **Features:** Filter by Year Level and Period. Print (PDF) capabilities.
- **View:** Categorized table (e.g., In-patient) showing specific procedures and fractional completion data (e.g., "2/15").

### Users (Doctors & Patients)
- **Doctors Table:** Avatar, Name, Email, Contact No., Role (Training Officer, Resident Doctor, Consultant, etc.), and Actions.
- **Patients Table:** HRN, Name, Age, Gender, Civil Status, Email, Created/Updated dates, and Actions.

### System Configuration
- **Forms:** Create/Duplicate forms with dynamic configurations (weights, points, choice types).
- **Domains:** Hierarchical structure management (e.g., "Attitude" under "Knowledge").
- **Procedures:** Management of specific medical procedures and types.
