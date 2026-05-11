import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
import { PERMISSIONS } from "../../src/Utils/Permissions/permissions.js";

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
    acc[perm.code] = perm.id;
    return acc;
  }, {});

  const mappings = [
    // super_admin: All permissions
    ...allPermissions.map((p) => ({
      roleId: roleMap["super_admin"],
      permissionId: p.id,
    })),

    // admin: Most permissions
    ...allPermissions.map((p) => ({
      roleId: roleMap["admin"],
      permissionId: p.id,
    })),

    // teacher permissions
    { roleId: roleMap["teacher"], permissionId: permMap[PERMISSIONS.TEACHER_PROFILE_READ] },
    { roleId: roleMap["teacher"], permissionId: permMap[PERMISSIONS.TEACHER_TRANSACTIONS_READ] },
    { roleId: roleMap["teacher"], permissionId: permMap[PERMISSIONS.TEACHER_MY_STUDENTS_READ] },
    { roleId: roleMap["teacher"], permissionId: permMap[PERMISSIONS.HOMEWORK_CREATE] },
    { roleId: roleMap["teacher"], permissionId: permMap[PERMISSIONS.HOMEWORK_READ] },
    { roleId: roleMap["teacher"], permissionId: permMap[PERMISSIONS.HOMEWORK_UPDATE] },
    { roleId: roleMap["teacher"], permissionId: permMap[PERMISSIONS.EXAM_CREATE] },
    { roleId: roleMap["teacher"], permissionId: permMap[PERMISSIONS.EXAM_READ] },
    { roleId: roleMap["teacher"], permissionId: permMap[PERMISSIONS.EXAM_UPDATE] },
    { roleId: roleMap["teacher"], permissionId: permMap[PERMISSIONS.WEEKLY_REPORT_CREATE] },
    { roleId: roleMap["teacher"], permissionId: permMap[PERMISSIONS.WEEKLY_REPORT_READ] },
    { roleId: roleMap["teacher"], permissionId: permMap[PERMISSIONS.CALENDAR_READ] },
    { roleId: roleMap["teacher"], permissionId: permMap[PERMISSIONS.LECTURE_READ] },

    // student permissions
    { roleId: roleMap["student"], permissionId: permMap[PERMISSIONS.STUDENT_DASHBOARD_READ] },
    { roleId: roleMap["student"], permissionId: permMap[PERMISSIONS.STUDENT_PROFILE_READ] },
    { roleId: roleMap["student"], permissionId: permMap[PERMISSIONS.STUDENT_PROFILE_UPDATE] },
    { roleId: roleMap["student"], permissionId: permMap[PERMISSIONS.HOMEWORK_READ] },
    { roleId: roleMap["student"], permissionId: permMap[PERMISSIONS.EXAM_READ] },
    { roleId: roleMap["student"], permissionId: permMap[PERMISSIONS.CALENDAR_READ] },
    { roleId: roleMap["student"], permissionId: permMap[PERMISSIONS.LECTURE_READ] },
    { roleId: roleMap["student"], permissionId: permMap[PERMISSIONS.RANK_READ] },
  ].filter((m) => m.roleId && m.permissionId);

  // Use a for...of loop to ensure all mappings are created
  for (const m of mappings) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: m.roleId,
          permissionId: m.permissionId,
        },
      },
      update: m,
      create: m,
    });
  }

  console.log(`Seeded ${mappings.length} role-permission mappings.`);
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
