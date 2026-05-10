import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const categories = [
  {
    title: "Technical Support",
    supports: {
      create: [
        {
          title: "WhatsApp Support",
          url: "https://wa.me/1234567890",
          description: "Chat with our technical team for immediate assistance.",
        },
        {
          title: "System Tutorial Videos",
          url: "https://youtube.com/playlist?list=system-tutorials",
          description: "Watch videos on how to use the platform effectively.",
        },
      ],
    },
  },
  {
    title: "Academic Support",
    supports: {
      create: [
        {
          title: "Teacher Handbook",
          url: "https://jipter.com/handbook",
          description: "Comprehensive guide for teachers on academic standards.",
        },
        {
          title: "Student FAQ",
          url: "https://jipter.com/faq-students",
          description: "Frequently asked questions for students.",
        },
      ],
    },
  },
  {
    title: "Billing & Payments",
    supports: {
      create: [
        {
          title: "Refund Policy",
          url: "https://jipter.com/refund-policy",
          description: "Learn about our refund rules and procedures.",
        },
      ],
    },
  },
];

export async function seedSupport() {
  console.log("Start seeding support data...");

  for (const category of categories) {
    const existingCategory = await prisma.support_category.findFirst({
      where: { title: category.title },
    });

    if (existingCategory) {
      // Update existing category and its supports (simplified for seeding)
      await prisma.support_category.update({
        where: { id: existingCategory.id },
        data: {
          title: category.title,
        },
      });
      console.log(`Updated category: ${category.title}`);
    } else {
      await prisma.support_category.create({
        data: category,
      });
      console.log(`Created category: ${category.title}`);
    }
  }

  console.log("Seeded support data.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedSupport()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
    });
}
