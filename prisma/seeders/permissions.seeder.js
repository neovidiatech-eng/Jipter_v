import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const permissions = [
  // Subject permissions
  { name: "view subject", code: "VIEW_SUBJECTS" },
  { name: "create subject", code: "CREATE_SUBJECT" },
  { name: "update subject", code: "UPDATE_SUBJECT" },
  { name: "delete subject", code: "DELETE_SUBJECT" },

  // Plan permissions
  { name: "view plan", code: "VIEW_PLANS" },
  { name: "create plan", code: "CREATE_PLAN" },
  { name: "update plan", code: "UPDATE_PLAN" },
  { name: "delete plan", code: "DELETE_PLAN" },

  // Role & Permission Management
  { name: "manage roles", code: "MANAGE_ROLES" },
  { name: "manage permissions", code: "MANAGE_PERMISSIONS" },

  // Stuff Management
  { name: "view stuff", code: "VIEW_STUFF" },
  { name: "create stuff", code: "CREATE_STUFF" },
  { name: "update stuff", code: "UPDATE_STUFF" },
  { name: "delete stuff", code: "DELETE_STUFF" },
];

export async function seedPermissions() {
  console.log("Start seeding permissions...");
  const seeded = await Promise.all(
    permissions.map((permission) =>
      prisma.permission.upsert({
        where: { name: permission.name },
        update: permission,
        create: permission,
      }),
    ),
  );
  console.log("Seeded permissions.");
  return seeded;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedPermissions()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
    });
}
