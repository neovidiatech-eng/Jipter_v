import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function seedRolePermissions() {
  console.log("Start seeding role-permission mappings...");

  const allRoles = await prisma.role.findMany();
  const roleMap = allRoles.reduce((acc, role) => {
    acc[role.name] = role.id;
    return acc;
  }, {});

  const allPermissions = await prisma.permission.findMany();
  const permMap = allPermissions.reduce((acc, perm) => {
    acc[perm.name] = perm.id;
    acc[perm.code] = perm.id; // Support both name and code mapping
    return acc;
  }, {});

  const mappings = [
    // super_admin: All permissions
    ...allPermissions.map((p) => ({
      roleId: roleMap["super_admin"],
      permissionId: p.id,
    })),

    // admin: Manage everything except potentially core system settings
    { roleId: roleMap["admin"], permissionId: permMap["VIEW_SUBJECTS"] },
    { roleId: roleMap["admin"], permissionId: permMap["CREATE_SUBJECT"] },
    { roleId: roleMap["admin"], permissionId: permMap["UPDATE_SUBJECT"] },
    { roleId: roleMap["admin"], permissionId: permMap["DELETE_SUBJECT"] },
    { roleId: roleMap["admin"], permissionId: permMap["VIEW_PLANS"] },
    { roleId: roleMap["admin"], permissionId: permMap["CREATE_PLAN"] },
    { roleId: roleMap["admin"], permissionId: permMap["UPDATE_PLAN"] },
    { roleId: roleMap["admin"], permissionId: permMap["DELETE_PLAN"] },
    { roleId: roleMap["admin"], permissionId: permMap["VIEW_STUFF"] },
    { roleId: roleMap["admin"], permissionId: permMap["CREATE_STUFF"] },
    { roleId: roleMap["admin"], permissionId: permMap["UPDATE_STUFF"] },
    { roleId: roleMap["admin"], permissionId: permMap["MANAGE_ROLES"] },

    // teacher: View subjects and plans
    { roleId: roleMap["teacher"], permissionId: permMap["VIEW_SUBJECTS"] },
    { roleId: roleMap["teacher"], permissionId: permMap["VIEW_PLANS"] },

    // student: View subjects and plans
    { roleId: roleMap["student"], permissionId: permMap["VIEW_SUBJECTS"] },
    { roleId: roleMap["student"], permissionId: permMap["VIEW_PLANS"] },
  ].filter((m) => m.roleId && m.permissionId);

  await Promise.all(
    mappings.map((m) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: m.roleId,
            permissionId: m.permissionId,
          },
        },
        update: m,
        create: m,
      }),
    ),
  );

  console.log("Seeded role-permission mappings successfully.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedRolePermissions()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
    });
}
