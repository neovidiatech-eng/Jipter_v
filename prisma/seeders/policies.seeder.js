import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const policies = [
  {
    title: "Teaching Standards",
    description: "Guidelines for maintaining high-quality teaching standards and professional conduct.",
    icon: "Shield",
    color: "blue",
    lastUpdated: new Date("2026-02-01"),
  },
  {
    title: "Attendance Policy",
    description: "Requirements for session attendance, punctuality, and procedures for absences.",
    icon: "Clock",
    color: "green",
    lastUpdated: new Date("2026-01-15"),
  },
  {
    title: "Content Guidelines",
    description: "Standards for creating and sharing educational content and materials.",
    icon: "FileText",
    color: "purple",
    lastUpdated: new Date("2026-01-20"),
  },
  {
    title: "Code of Conduct",
    description: "Professional behavior expectations and ethical guidelines for instructors.",
    icon: "AlertCircle",
    color: "orange",
    lastUpdated: new Date("2025-12-10"),
  },
];

export const notice = {
  title: "Important Notice",
  content: "All instructors are required to review and acknowledge these policies. Please ensure you're familiar with the latest updates. For questions or clarifications, contact the admin team.",
  active: true,
};

export async function seedPolicies() {
  console.log("Start seeding policies...");
  
  // Upsert policies by title
  for (const policy of policies) {
    await prisma.policy.upsert({
      where: { id: (await prisma.policy.findFirst({ where: { title: policy.title } }))?.id || "00000000-0000-0000-0000-000000000000" },
      update: policy,
      create: policy,
    });
  }

  // Upsert notice
  const existingNotice = await prisma.policy_notice.findFirst();
  if (existingNotice) {
    await prisma.policy_notice.update({
      where: { id: existingNotice.id },
      data: notice,
    });
  } else {
    await prisma.policy_notice.create({
      data: notice,
    });
  }

  console.log("Seeded policies and notice.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedPolicies()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
    });
}
