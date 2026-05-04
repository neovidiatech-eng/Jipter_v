import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const subjects = [
  { name: "Mathematics", active: true, color: "#3498db" },
  { name: "Physics", active: true, color: "#e74c3c" },
  { name: "Chemistry", active: true, color: "#2ecc71" },
  { name: "Biology", active: true, color: "#f1c40f" },
  { name: "English", active: true, color: "#9b59b6" },
  { name: "Arabic", active: true, color: "#34495e" },
  { name: "History", active: true, color: "#e67e22" },
  { name: "Geography", active: true, color: "#1abc9c" },
];

export async function seedSubjects() {
  console.log("Start seeding subjects...");

  const silverRank = await prisma.ranks.findUnique({
    where: { slug: "silver" },
  });

  if (!silverRank) {
    console.warn("Silver rank not found, skipping subjects seeding.");
    return;
  }

  for (const subject of subjects) {
    await prisma.subjects.upsert({
      where: {
        name_rankId: {
          name: subject.name,
          rankId: silverRank.id,
        },
      },
      update: {
        ...subject,
        rankId: silverRank.id,
      },
      create: {
        ...subject,
        rankId: silverRank.id,
      },
    });
  }
  console.log("Seeded subjects.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedSubjects()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
    });
}
