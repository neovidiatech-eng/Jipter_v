import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function seedRequests() {
  console.log("Start seeding requests...");

  const teacher = await prisma.user.findFirst({
    where: { role: { name: "teacher" } },
  });

  const student = await prisma.user.findFirst({
    where: { role: { name: "student" } },
  });

  if (!teacher || !student) {
    console.warn("Teacher or student not found. Skipping requests seeding.");
    return;
  }

  // Clear old requests
  await prisma.request.deleteMany({});

  const requests = [
    {
      title: "Personal Leave Request",
      type: "vacation",
      priority: "medium",
      status: "pending",
      reason: "Need to take a day off for family matters",
      requesterId: teacher.id,
      requesterRole: "teacher",
    },
    {
      title: "Technical Issue with Video",
      type: "technical_issue",
      priority: "high",
      status: "pending",
      reason: "Unable to access recorded session from Feb 20",
      requesterId: student.id,
      requesterRole: "student",
    },
    {
      title: "Reschedule Python Session",
      type: "reschedule",
      priority: "high",
      status: "approved",
      reason: "Request to move the session from 2 PM to 4 PM",
      requesterId: teacher.id,
      requesterRole: "teacher",
      adminNotes: "Approved as per student confirmation",
    },
    {
      title: "Medical Leave",
      type: "sick_leave",
      priority: "high",
      status: "approved",
      reason: "Scheduled doctor's appointment",
      requesterId: teacher.id,
      requesterRole: "teacher",
    },
    {
      title: "Reschedule React Workshop",
      type: "reschedule",
      priority: "low",
      status: "rejected",
      reason: "Conflict with another commitment",
      requesterId: student.id,
      requesterRole: "student",
      adminNotes: "Teacher is not available at the proposed time",
    },
  ];

  for (const req of requests) {
    await prisma.request.create({
      data: req,
    });
  }

  console.log("✅ Requests seeded successfully");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedRequests()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
    });
}
