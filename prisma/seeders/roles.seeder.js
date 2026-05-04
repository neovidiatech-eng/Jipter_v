import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const roles = [
  { name: "super_admin" },
  { name: "admin" },
  { name: "teacher" },
  { name: "student" },
];

export async function seedRoles() {
  console.log("Start seeding roles...");

  const seededRoles = await Promise.all(
    roles.map((role) =>
      prisma.role.upsert({
        where: { name: role.name },
        update: role,
        create: role,
      }),
    ),
  );

  console.log("Seeded roles.");
  return seededRoles;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedRoles()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
    });
}
