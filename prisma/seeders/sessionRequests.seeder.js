import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function seedSessionRequests() {
  console.log("Start seeding session requests...");

  const teacher = await prisma.user.findFirst({
    where: { email: "ahmed.teacher@jipter.com" },
  });

  const student = await prisma.user.findFirst({
    where: { email: "john.doe@jipter.com" },
  });

  const schedule = await prisma.schedule.findFirst();

  if (!teacher || !student) {
    console.warn("Teacher or student not found. Skipping session requests seeding.");
    return;
  }

  const requests = [
    {
      requesterId: student.id,
      requesterRole: "student",
      type: "reschedule",
      status: "pending",
      reason: "I have an emergency",
      sessionId: schedule?.id,
      requestedData: { new_start_time: "2026-03-28T14:00:00Z" },
    },
    {
      requesterId: teacher.id,
      requesterRole: "teacher",
      type: "cancel",
      status: "pending",
      reason: "Sick leave",
      sessionId: schedule?.id,
    },
    {
      requesterId: student.id,
      requesterRole: "student",
      type: "new_session",
      status: "approved",
      reason: "Need extra help with Calculus",
      requestedData: { subject: "Calculus", preferred_time: "2026-03-30T10:00:00Z" },
    },
  ];

  /* 🧹 Optional: Clear old requests to ensure consistency */
  await prisma.session_request.deleteMany({});

  for (const data of requests) {
    await prisma.session_request.create({ data });
  }

  console.log("✅ Session requests seeded successfully");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedSessionRequests()
    .catch(console.error)
    .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
    });
}
