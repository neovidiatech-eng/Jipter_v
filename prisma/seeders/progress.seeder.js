import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function seedProgress() {
  console.log("Start seeding student progress...");

  const user = await prisma.user.findUnique({
    where: { email: "john.doe@jipter.com" },
  });

  if (!user) {
    console.warn("User john.doe@jipter.com not found, skipping progress seeding");
    return;
  }

  const course = await prisma.courses.findUnique({
    where: { title: "Data Structures" },
    include: { lectures: { orderBy: { order: "asc" } } },
  });

  if (!course) {
    console.warn("Course 'Data Structures' not found, skipping progress seeding");
    return;
  }

  // Mark first 5 lectures as completed (as in the image)
  const lecturesToComplete = course.lectures.slice(0, 5);

  for (const lecture of lecturesToComplete) {
    await prisma.user_lectures.upsert({
      where: {
        userId_lectureId: {
          userId: user.id,
          lectureId: lecture.id,
        },
      },
      update: {
        status: "completed",
        completedAt: new Date(),
      },
      create: {
        userId: user.id,
        lectureId: lecture.id,
        status: "completed",
        completedAt: new Date(),
      },
    });
  }

  console.log("Seeded student progress successfully.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedProgress()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
    });
}
