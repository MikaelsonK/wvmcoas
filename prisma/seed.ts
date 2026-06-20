// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '@/lib/password';

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log("🚀 Starting database seeding...");

  // 1. Seed Users (Admin, Evaluators, Residents)
  console.log("Seeding users...");
  const adminPassword = await hashPassword("SecurePass123!");
  const evaluatorPassword = await hashPassword("ReviewPass456!");
  const residentPassword = await hashPassword("MyBasicPass789!");

  const users = [
    { email: "admin@hospital.com", role: "ADMIN" as Role, name: "System Administrator", passwordHash: adminPassword },
    { email: "evaluator@hospital.com", role: "EVALUATOR" as Role, name: "Chief Evaluator Officer", passwordHash: evaluatorPassword },
    { email: "dr.smith@hospital.com", role: "EVALUATOR" as Role, name: "Dr. Sarah Smith (OBGYN Consultant)", passwordHash: evaluatorPassword },
    { email: "dr.jones@hospital.com", role: "EVALUATOR" as Role, name: "Dr. Robert Jones (Gynecology Lead)", passwordHash: evaluatorPassword },
    { email: "resident@hospital.com", role: "RESIDENT" as Role, name: "Dr. Clara Oswald (Resident Y1)", passwordHash: residentPassword, yearLevel: 1 },
    { email: "resident2@hospital.com", role: "RESIDENT" as Role, name: "Dr. Emily Stone (Resident Y2)", passwordHash: residentPassword, yearLevel: 2 },
    { email: "resident3@hospital.com", role: "RESIDENT" as Role, name: "Dr. Mark Davis (Resident Y3)", passwordHash: residentPassword, yearLevel: 3 },
  ];

  const seededUsers: Record<string, any> = {};
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        passwordHash: u.passwordHash,
        role: u.role,
      },
      create: {
        email: u.email,
        name: u.name,
        passwordHash: u.passwordHash,
        role: u.role,
      },
    });
    seededUsers[u.email] = user;

    if (u.role === "RESIDENT" && u.yearLevel) {
      await prisma.residentProfile.upsert({
        where: { userId: user.id },
        update: { yearLevel: u.yearLevel },
        create: { userId: user.id, yearLevel: u.yearLevel },
      });
    } else if (u.role === "EVALUATOR") {
      await prisma.evaluatorProfile.upsert({
        where: { userId: user.id },
        update: { designation: "CONSULTANT" },
        create: { userId: user.id, designation: "CONSULTANT" },
      });
    }
  }
  console.log("✅ Users and profiles seeded successfully.");

  // 2. Seed Academic Periods
  console.log("Seeding academic periods...");
  const periods = [
    { name: "Academic Year 2025-2026", startDate: new Date("2025-07-01"), endDate: new Date("2026-06-30") },
    { name: "Academic Year 2026-2027", startDate: new Date("2026-07-01"), endDate: new Date("2027-06-30") },
  ];

  const seededPeriods: Record<string, any> = {};
  for (const p of periods) {
    const period = await prisma.period.upsert({
      where: { id: p.name.replace(/\s+/g, '-').toLowerCase() }, // Unique ID generation for seeding
      update: { startDate: p.startDate, endDate: p.endDate },
      create: {
        id: p.name.replace(/\s+/g, '-').toLowerCase(),
        name: p.name,
        startDate: p.startDate,
        endDate: p.endDate,
      },
    });
    seededPeriods[p.name] = period;
  }
  console.log("✅ Academic periods seeded successfully.");

  // 3. Seed Clinical Domains (Hierarchy)
  console.log("Seeding clinical domains...");
  
  // Root Domains
  const domainsData = [
    { name: "Patient Care" },
    { name: "Medical Knowledge" },
    { name: "Professionalism" },
    { name: "Interpersonal & Communication Skills" },
  ];

  const seededDomains: Record<string, any> = {};
  for (const d of domainsData) {
    const domain = await prisma.domain.upsert({
      where: { id: d.name.replace(/[^a-zA-Z]/g, '').toLowerCase() },
      update: {},
      create: {
        id: d.name.replace(/[^a-zA-Z]/g, '').toLowerCase(),
        name: d.name,
      },
    });
    seededDomains[d.name] = domain;
  }

  // Child Domains
  const subDomains = [
    { name: "Obstetric Care", parentName: "Patient Care" },
    { name: "Gynecologic Care", parentName: "Patient Care" },
    { name: "Ethics & Integrity", parentName: "Professionalism" },
    { name: "Patient Counseling", parentName: "Interpersonal & Communication Skills" },
  ];

  for (const sd of subDomains) {
    const parent = seededDomains[sd.parentName];
    const subDomain = await prisma.domain.upsert({
      where: { id: sd.name.replace(/[^a-zA-Z]/g, '').toLowerCase() },
      update: { parentId: parent.id },
      create: {
        id: sd.name.replace(/[^a-zA-Z]/g, '').toLowerCase(),
        name: sd.name,
        parentId: parent.id,
      },
    });
    seededDomains[sd.name] = subDomain;
  }
  console.log("✅ Clinical domains and sub-domains seeded successfully.");

  // 4. Seed Procedure Types and Procedures
  console.log("Seeding procedure categories...");
  const procedureTypesData = [
    { name: "Major Obstetrics" },
    { name: "Minor Obstetrics" },
    { name: "Major Gynecology" },
    { name: "Minor Gynecology" },
  ];

  const seededProcTypes: Record<string, any> = {};
  for (const pt of procedureTypesData) {
    const ptype = await prisma.procedureType.upsert({
      where: { id: pt.name.replace(/\s+/g, '-').toLowerCase() },
      update: {},
      create: {
        id: pt.name.replace(/\s+/g, '-').toLowerCase(),
        name: pt.name,
      },
    });
    seededProcTypes[pt.name] = ptype;
  }

  const procedures = [
    { name: "Normal Spontaneous Delivery (NSD)", typeName: "Major Obstetrics", domainName: "Obstetric Care" },
    { name: "Cesarean Delivery (Primary/Repeat)", typeName: "Major Obstetrics", domainName: "Obstetric Care" },
    { name: "Assisted Vaginal Delivery (Forceps/Vacuum)", typeName: "Major Obstetrics", domainName: "Obstetric Care" },
    { name: "Dilatation & Curettage (D&C)", typeName: "Minor Obstetrics", domainName: "Obstetric Care" },
    { name: "Episiotomy and Repair", typeName: "Minor Obstetrics", domainName: "Obstetric Care" },
    { name: "Total Abdominal Hysterectomy (TAH)", typeName: "Major Gynecology", domainName: "Gynecologic Care" },
    { name: "Bilateral Salpingo-Oophorectomy (BSO)", typeName: "Major Gynecology", domainName: "Gynecologic Care" },
    { name: "Endometrial Biopsy", typeName: "Minor Gynecology", domainName: "Gynecologic Care" },
    { name: "Colposcopy", typeName: "Minor Gynecology", domainName: "Gynecologic Care" },
  ];

  for (const proc of procedures) {
    const parentType = seededProcTypes[proc.typeName];
    const domain = seededDomains[proc.domainName];
    await prisma.procedure.upsert({
      where: { id: proc.name.replace(/[^a-zA-Z]/g, '').toLowerCase() },
      update: { procedureTypeId: parentType.id, domainId: domain.id },
      create: {
        id: proc.name.replace(/[^a-zA-Z]/g, '').toLowerCase(),
        name: proc.name,
        procedureTypeId: parentType.id,
        domainId: domain.id,
      },
    });
  }
  console.log("✅ Procedures seeded successfully.");

  // 5. Seed Evaluation Forms and Questions
  console.log("Seeding clinical evaluation forms...");
  
  // Form 1: DOPS - Cesarean Section (Mapped to Obstetric Care domain and Cesarean procedure)
  const form1Id = "dops-cesarean-section";
  const obstetricCareDomain = seededDomains["Obstetric Care"];
  const cesareanProcId = "cesareandeliveryprimaryrepeat";
  
  const form1 = await prisma.form.upsert({
    where: { id: form1Id },
    update: { domainId: obstetricCareDomain.id, procedureId: cesareanProcId },
    create: {
      id: form1Id,
      title: "DOPS: Cesarean Section Evaluation Form",
      domainId: obstetricCareDomain.id,
      procedureId: cesareanProcId,
    },
  });

  const form1Questions = [
    { label: "Consent & Patient Prep (Pre-op counseling, safety verification)", maxPoints: 5, weight: 1.0 },
    { label: "Anatomical Entry (Incision, rectus separation, peritoneal entry)", maxPoints: 5, weight: 1.5 },
    { label: "Uterine Hysterotomy & Delivery (Incision, safe extension, head extraction)", maxPoints: 5, weight: 2.0 },
    { label: "Placenta & Hemostasis (Removal, uterine massage, checking bleeding)", maxPoints: 5, weight: 2.0 },
    { label: "Uterine & Fascial Closure (Proper suturing layers, anatomically correct)", maxPoints: 5, weight: 1.5 },
    { label: "Professionalism & Communication (Team interaction, patient comfort)", maxPoints: 5, weight: 1.0 },
  ];

  for (let idx = 0; idx < form1Questions.length; idx++) {
    const q = form1Questions[idx];
    await prisma.question.upsert({
      where: { id: `${form1Id}-q-${idx + 1}` },
      update: { label: q.label, maxPoints: q.maxPoints, weight: q.weight },
      create: {
        id: `${form1Id}-q-${idx + 1}`,
        formId: form1.id,
        label: q.label,
        maxPoints: q.maxPoints,
        weight: q.weight,
        questionType: "single_select",
      },
    });
  }

  // Form 2: Professionalism & Communication Form (Mapped to Ethics & Integrity domain)
  const form2Id = "professionalism-integrity-eval";
  const ethicsDomain = seededDomains["Ethics & Integrity"];
  
  const form2 = await prisma.form.upsert({
    where: { id: form2Id },
    update: { domainId: ethicsDomain.id },
    create: {
      id: form2Id,
      title: "OBGYN Professionalism & Ethics Review",
      domainId: ethicsDomain.id,
    },
  });

  const form2Questions = [
    { label: "Compassion & Empathy (Treatment of patients, warmth, bedside manner)", maxPoints: 5, weight: 1.0 },
    { label: "Reliability & Integrity (Timeliness, task completion, honesty)", maxPoints: 5, weight: 1.0 },
    { label: "Respect & Inclusivity (Collaboration with nurses, doctors, auxiliary staff)", maxPoints: 5, weight: 1.0 },
    { label: "Ethical Decision Making (Patient privacy compliance, billing integrity)", maxPoints: 5, weight: 1.0 },
  ];

  for (let idx = 0; idx < form2Questions.length; idx++) {
    const q = form2Questions[idx];
    await prisma.question.upsert({
      where: { id: `${form2Id}-q-${idx + 1}` },
      update: { label: q.label, maxPoints: q.maxPoints, weight: q.weight },
      create: {
        id: `${form2Id}-q-${idx + 1}`,
        formId: form2.id,
        label: q.label,
        maxPoints: q.maxPoints,
        weight: q.weight,
        questionType: "single_select",
      },
    });
  }

  // Form 3: Medical Knowledge & Diagnostics (Mapped to Medical Knowledge domain)
  const form3Id = "medical-knowledge-diagnostics";
  const knowledgeDomain = seededDomains["Medical Knowledge"];

  const form3 = await prisma.form.upsert({
    where: { id: form3Id },
    update: { domainId: knowledgeDomain.id },
    create: {
      id: form3Id,
      title: "Medical Knowledge: Case Presentation & Diagnostics",
      domainId: knowledgeDomain.id,
    },
  });

  const form3Questions = [
    { label: "Case Synthesis (Coherent summary of history, physical, and findings)", maxPoints: 5, weight: 1.0 },
    { label: "Differential Diagnosis (Formulation of logical and prioritized list)", maxPoints: 5, weight: 1.5 },
    { label: "Evidence-Based Management Plan (Application of clinical guidelines)", maxPoints: 5, weight: 1.5 },
    { label: "Pathology Understanding (Explaining underlying obstetric or gyn conditions)", maxPoints: 5, weight: 1.0 },
  ];

  for (let idx = 0; idx < form3Questions.length; idx++) {
    const q = form3Questions[idx];
    await prisma.question.upsert({
      where: { id: `${form3Id}-q-${idx + 1}` },
      update: { label: q.label, maxPoints: q.maxPoints, weight: q.weight },
      create: {
        id: `${form3Id}-q-${idx + 1}`,
        formId: form3.id,
        label: q.label,
        maxPoints: q.maxPoints,
        weight: q.weight,
        questionType: "single_select",
      },
    });
  }
  console.log("✅ Evaluation forms and clinical questions seeded successfully.");

  // 6. Seed Patients (Pre-populated HRN registry)
  console.log("Seeding mock patients...");
  const patientsData = [
    { hrn: "HRN-2026-0001", name: "Maria Clara Santos", age: 28, gender: "FEMALE", civilStatus: "MARRIED", email: "maria.santos@gmail.com" },
    { hrn: "HRN-2026-0002", name: "Juana Dela Cruz", age: 34, gender: "FEMALE", civilStatus: "SINGLE", email: "juana.dc@yahoo.com" },
    { hrn: "HRN-2026-0003", name: "Sarah Connor Smith", age: 41, gender: "FEMALE", civilStatus: "DIVORCED", email: "sarah.connor@outlook.com" },
    { hrn: "HRN-2026-0004", name: "Elena Gilbert", age: 24, gender: "FEMALE", civilStatus: "SINGLE", email: "elena.g@gmail.com" },
    { hrn: "HRN-2026-0005", name: "Patricia Ramos", age: 31, gender: "FEMALE", civilStatus: "MARRIED", email: "patty.ramos@gmail.com" },
  ];

  for (const pat of patientsData) {
    await prisma.patient.upsert({
      where: { hrn: pat.hrn },
      update: { name: pat.name, age: pat.age, gender: pat.gender, civilStatus: pat.civilStatus, email: pat.email },
      create: {
        hrn: pat.hrn,
        name: pat.name,
        age: pat.age,
        gender: pat.gender,
        civilStatus: pat.civilStatus,
        email: pat.email,
      },
    });
  }
  console.log("✅ Patients registry seeded successfully.");

  console.log("🚀 Database seeding completed successfully!");
}

seedDatabase()
  .catch((e) => {
    console.error("🛑 Seeding process failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Database connection closed.");
  });
