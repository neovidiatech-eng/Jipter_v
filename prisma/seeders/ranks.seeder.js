import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const ranks = [
  {
    name: "SILVER",
    slug: "silver",
    color: "#C0C0C0",
    ageRange: { minAge: 5, maxAge: 10 },
  },
  {
    name: "GOLD",
    slug: "gold",
    color: "#FFD700",
    ageRange: { minAge: 11, maxAge: 15 },
  },
  {
    name: "PLATINUM",
    slug: "platinum",
    color: "#E5E4E2",
    ageRange: { minAge: 16, maxAge: 18 },
  },
  {
    name: "TITAN",
    slug: "titan",
    color: "#000080",
    ageRange: { minAge: 18, maxAge: 99 },
  },
];

export async function seedRanks() {
  console.log("Start seeding ranks...");

  for (const rank of ranks) {
    await prisma.ranks.upsert({
      where: { slug: rank.slug },
      update: {
        name: rank.name,
        color: rank.color,
        ageRange: rank.ageRange,
      },
      create: {
        name: rank.name,
        slug: rank.slug,
        color: rank.color,
        ageRange: rank.ageRange,
      },
    });
  }
  console.log("Seeded ranks successfully.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedRanks()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
    });
}
