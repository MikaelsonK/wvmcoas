import { Question } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.length === 0) throw new Error(`Missing env var: ${name}`);
  return v;
}

async function main() {
  const adminPass = requireEnv("SEED_ADMIN_PASSWORD");
  const evaluatorPass = requireEnv("SEED_EVALUATOR_PASSWORD");
  const residentPass = requireEnv("SEED_RESIDENT_PASSWORD");

  const adminHash = await hashPassword(adminPass);
  const evaluatorHash = await hashPassword(evaluatorPass);
  const residentHash = await hashPassword(residentPass);

  const admin = await prisma.user.upsert({
    where: { email: "admin@oas.local" },
    update: {},
    create: { email: "admin@oas.local", name: "Admin User", passwordHash: adminHash, role: "ADMIN" },
  });

  const evaluator = await prisma.user.upsert({
    where: { email: "evaluator@oas.local" },
    update: {},
    create: {
      email: "evaluator@oas.local",
      name: "Dr. Evaluator",
      passwordHash: evaluatorHash,
      role: "EVALUATOR",
      evaluatorProfile: { create: {} },
    },
  });

  const resident = await prisma.user.upsert({
    where: { email: "resident@oas.local" },
    update: {},
    create: {
      email: "resident@oas.local",
      name: "Dr. Resident",
      passwordHash: residentHash,
      role: "RESIDENT",
      residentProfile: { create: { yearLevel: 1 } },
    },
  });

  const period = await prisma.period.create({
    data: {
      name: "AY 2026 - Period 1",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-03-31"),
    },
  });

  const form = await prisma.form.create({
    data: {
      title: "Core Clinical Competence",
      questions: {
        create: [
          { label: "Clinical reasoning", maxPoints: 10 },
          { label: "Communication", maxPoints: 10 },
          { label: "Professionalism", maxPoints: 10 },
        ],
      },
    },
    include: { questions: true },
  });

  await prisma.evaluation.create({
    data: {
      evaluatorId: evaluator.id,
      residentId: resident.id,
      periodId: period.id,
      formId: form.id,
      scores: {
        create: form.questions.map((q: Question, idx: number) => ({
          questionId: q.id,
          points: idx === 0 ? 8 : idx === 1 ? 9 : 10,
        })),
      },

    },
  });

  console.log("Seed complete:");
  console.log("Admin:", admin.email, adminPass);
  console.log("Evaluator:", evaluator.email, evaluatorPass);
  console.log("Resident:", resident.email, residentPass);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
