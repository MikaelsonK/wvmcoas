// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '@/lib/password';

const prisma = new PrismaClient();

async function seedTestUsers() {
  console.log("Starting test user seeding...");

  const usersToSeed = [
    { email: "admin@hospital.com", role: "ADMIN", name: "System Administrator", passwordPlain: "SecurePass123!" },
    { email: "evaluator@hospital.com", role: "EVALUATOR", name: "Chief Evaluator Officer", passwordPlain: "ReviewPass456!" },
    { email: "resident@hospital.com", role: "RESIDENT", name: "General Resident Staff", passwordPlain: "MyBasicPass789!" },
  ];

  for (const user of usersToSeed) {
    console.log(`\nProcessing user: ${user.email} (${user.role})`);
    try {
      // Hash the plain text password FIRST using our utility
      const hashedPassword = await hashPassword(user.passwordPlain);
      console.log(`✅ Password for ${user.email} has been hashed.`);

      // Insert/Update user in database
      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          passwordHash: hashedPassword,
          role: user.role as Role,
          name: user.name,
        },
        create: {
          email: user.email,
          passwordHash: hashedPassword,
          role: user.role as Role,
          name: user.name,
        },
      });
      console.log(`✅ Successfully seeded/updated user ${user.email} with role ${user.role}.`);

    } catch (error) {
      console.error(`❌ Error seeding user ${user.email}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log("\n✅ All test users have been seeded successfully!");
}

seedTestUsers()
  .catch(e => {
    console.error("🛑 Failed to complete seeding process:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("\nDatabase connection closed.");
  });
