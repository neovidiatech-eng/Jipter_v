import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
import { seedCurrencies } from "./seeders/currency.seeder.js";
import { seedPlans } from "./seeders/plans.seeder.js";
import { seedPermissions } from "./seeders/permissionsSeeder.js";
import { seedStuff } from "./seeders/stuff.seeder.js";
import { seedTeachers } from "./seeders/teachers.seeder.js";
import { seedStudents } from "./seeders/student.seeder.js";
import { seedSchedules } from "./seeders/schedules.seeder.js";
import { seedSubscriptionRequests } from "./seeders/subscriptionRequests.seeder.js";
import { seedExpenses } from "./seeders/expenses.seeder.js";
import { seedSubscriptions } from "./seeders/subscriptions.seeder.js";
import { seedSystemWallet } from "./seeders/systemWallet.seeder.js";
import { seedRequests } from "./seeders/requests.seeder.js";
import { seedMatrials } from "./seeders/matrials.seeder.js";
import { seedSettings } from "./seeders/settings.seeder.js";
import { seedPolicies } from "./seeders/policies.seeder.js";
import { seedProgress } from "./seeders/progress.seeder.js";
import { seedSupport } from "./seeders/support.seeder.js";
import { seedChat } from "./seeders/chat.seeder.js";


dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("--- Starting Global Seeding ---");

  await seedCurrencies();
  await seedSettings();
  await seedMatrials();
  await seedPlans();
  await seedPermissions();
  await seedStuff();
  await seedTeachers();
  await seedStudents();
  await seedSubscriptionRequests();
  await seedSchedules();
  await seedExpenses();
  await seedSystemWallet();
  await seedRequests();
  await seedPolicies();
  await seedProgress();
  await seedSupport();
  await seedChat();

  console.log("--- Seeding Finished Successfully ---");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
