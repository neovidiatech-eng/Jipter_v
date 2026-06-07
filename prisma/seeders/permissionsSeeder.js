import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
import { PERMISSIONS_V2 } from "../../src/Constants/permissions.constants.js";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seeds default roles and permissions for the dynamic RBAC system.
 */
export const seedPermissions = async () => {
  console.log("Seeding Dynamic RBAC System...");

  // 1. Flatten all permission codes from constants
  const permissionCodes = [];
  Object.values(PERMISSIONS_V2).forEach(resource => {
    Object.values(resource).forEach(code => {
      permissionCodes.push(code);
    });
  });

  // 2. Create permissions in DB
  console.log(`Creating ${permissionCodes.length} permissions...`);
  const permissionIds = [];
  for (const code of permissionCodes) {
    const name = code.replace(":", " ").replace("_", " ").toUpperCase();
    const p = await prisma.permission.upsert({
      where: { code },
      update: {},
      create: { name, code },
    });
    permissionIds.push(p.id);
  }

  // 3. Create default roles
  const roles = [
    { name: "super_admin" },
    { name: "admin" },
    { name: "teacher" },
    { name: "student" },
    { name: "staff" },
  ];

  console.log("Creating default roles...");
  for (const r of roles) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });

    // 4. Assign permissions based on role logic
    let permissionsToAssign = [];

    if (role.name === "admin" || role.name === "super_admin") {
      console.log(`Assigning all permissions to ${role.name}...`);
      permissionsToAssign = permissionIds;
    } else if (role.name === "teacher") {
      console.log(`Assigning teacher permissions to ${role.name}...`);
      const teacherCodes = [
        PERMISSIONS_V2.DASHBOARD.READ,
        PERMISSIONS_V2.POLICIES.READ,
        PERMISSIONS_V2.PROFILE.VIEW,
        PERMISSIONS_V2.PROFILE.UPDATE,
        PERMISSIONS_V2.COURSES.READ,
        ...Object.values(PERMISSIONS_V2.LECTURES),
        ...Object.values(PERMISSIONS_V2.SESSIONS),
        ...Object.values(PERMISSIONS_V2.HOMEWORK),
        ...Object.values(PERMISSIONS_V2.EXAMS),
        ...Object.values(PERMISSIONS_V2.REQUESTS),
        ...Object.values(PERMISSIONS_V2.WEEKLY_REPORTS),
        ...Object.values(PERMISSIONS_V2.SUPPORT),
        PERMISSIONS_V2.CALENDAR.READ,
        ...Object.values(PERMISSIONS_V2.CHAT),
        PERMISSIONS_V2.FINANCES.READ,
        PERMISSIONS_V2.WITHDRAWALS.READ,
        PERMISSIONS_V2.WITHDRAWALS.CREATE,
        ...Object.values(PERMISSIONS_V2.RANKS),
      ];
      const pObjs = await prisma.permission.findMany({ where: { code: { in: teacherCodes } } });
      permissionsToAssign = pObjs.map((p) => p.id);
    } else if (role.name === "student") {
      console.log(`Assigning student permissions to ${role.name}...`);
      const studentCodes = [
        PERMISSIONS_V2.DASHBOARD.READ,
        PERMISSIONS_V2.POLICIES.READ,
        PERMISSIONS_V2.PROFILE.VIEW,
        PERMISSIONS_V2.PROFILE.UPDATE,
        PERMISSIONS_V2.COURSES.READ,
        PERMISSIONS_V2.LECTURES.READ,
        PERMISSIONS_V2.SESSIONS.READ,
        PERMISSIONS_V2.SESSIONS.JOIN,
        PERMISSIONS_V2.SESSIONS.LEAVE,
        PERMISSIONS_V2.HOMEWORK.READ,
        PERMISSIONS_V2.EXAMS.READ,
        PERMISSIONS_V2.REQUESTS.READ,
        PERMISSIONS_V2.REQUESTS.CREATE,
        PERMISSIONS_V2.WEEKLY_REPORTS.READ,
        PERMISSIONS_V2.SUPPORT.READ,
        PERMISSIONS_V2.CALENDAR.READ,
        PERMISSIONS_V2.CHAT.READ,
        PERMISSIONS_V2.CHAT.CREATE,
        PERMISSIONS_V2.RANKS.READ,
      ];
      const pObjs = await prisma.permission.findMany({ where: { code: { in: studentCodes } } });
      permissionsToAssign = pObjs.map((p) => p.id);
    }

    if (permissionsToAssign.length > 0) {
      const existingRolePermissions = await prisma.rolePermission.findMany({
        where: { roleId: role.id },
        select: { permissionId: true },
      });

      const existingIds = new Set(existingRolePermissions.map((rp) => rp.permissionId));
      const newPermissionsToAssign = permissionsToAssign.filter((id) => !existingIds.has(id));

      if (newPermissionsToAssign.length > 0) {
        await prisma.rolePermission.createMany({
          data: newPermissionsToAssign.map((id) => ({
            roleId: role.id,
            permissionId: id,
          })),
        });
      }
    }
  }

  console.log("Dynamic RBAC Seeding Completed.");
};

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
