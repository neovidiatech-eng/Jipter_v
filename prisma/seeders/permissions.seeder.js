import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
import { PERMISSIONS } from "../../src/Utils/Permissions/permissions.js";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Converts a permission key (e.g., "STUDENT_DASHBOARD_READ") 
 * into a readable name (e.g., "Student Dashboard Read").
 */
const formatName = (key) => {
  return key
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const permissions = Object.entries(PERMISSIONS).map(([key, code]) => ({
  name: formatName(key),
  code: code,
}));

export async function seedPermissions() {
  console.log("Start seeding permissions...");
  
  // Use a for...of loop or Promise.all to upsert all permissions
  const results = [];
  for (const permission of permissions) {
    const p = await prisma.permission.upsert({
      where: { code: permission.code },
      update: { name: permission.name },
      create: permission,
    });
    results.push(p);
  }

  console.log(`Seeded ${results.length} permissions.`);
  return results;
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
