import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function seedSubscriptionRequests() {
  console.log("Start seeding subscription requests...");

  const student = await prisma.user.findFirst({
    where: { role: { name: "student" } },
  });

  const plan = await prisma.plan.findFirst();

  if (!student || !plan) {
    console.warn("Student or plan not found. Skipping subscription requests seeding.");
    return;
  }

  const requests = [
    {
      user_id: student.id,
      planId: plan.id,
      status: "pending",
    },
    {
      user_id: student.id,
      planId: plan.id,
      status: "approved",
    },
  ];

  // Clear old requests
  await prisma.subscription_requests.deleteMany({});

  for (const data of requests) {
    await prisma.subscription_requests.create({
      data,
    });
  }

  console.log("✅ Subscription requests seeded successfully");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedSubscriptionRequests()
    .catch(console.error)
    .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
    });
}
