import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const matrialsData = [
  {
    name: "SILVER",
    slug: "silver",
    color: "#C0C0C0",
    ageRange: { minAge: 5, maxAge: 10 },
    courses: [
      {
        title: "Introduction to English",
        description: "Basic English for beginners",
        lectures: [
          { title: "Alphabet", content: "Learn the English alphabet", order: 1, videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          { title: "Numbers", content: "Learn numbers from 1 to 10", order: 2, videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        ],
      },
      {
        title: "Basic Math",
        description: "Arithmetic for young learners",
        lectures: [
          { title: "Addition", content: "Learn how to add numbers", order: 1, videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          { title: "Subtraction", content: "Learn how to subtract numbers", order: 2, videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        ],
      },
    ],
  },
  {
    name: "GOLD",
    slug: "gold",
    color: "#FFD700",
    ageRange: { minAge: 11, maxAge: 15 },
    courses: [
      {
        title: "Intermediate English",
        description: "Improving grammar and vocabulary",
        lectures: [
          { title: "Tenses", content: "Present, Past, and Future tenses", order: 1, videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          { title: "Sentence Structure", content: "Building complex sentences", order: 2, videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        ],
      },
    ],
  },
  {
    name: "PLATINUM",
    slug: "platinum",
    color: "#E5E4E2",
    ageRange: { minAge: 16, maxAge: 18 },
    courses: [
      {
        title: "Advanced Science",
        description: "Deep dive into Physics and Chemistry",
        lectures: [
          { title: "Quantum Mechanics Intro", content: "Basics of quantum mechanics", order: 1, videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        ],
      },
    ],
  },
  {
    name: "TITAN",
    slug: "titan",
    color: "#000080",
    ageRange: { minAge: 18, maxAge: 99 },
    courses: [
      {
        title: "Professional Development",
        description: "Skills for the workplace",
        lectures: [
          { title: "Leadership Skills", content: "How to lead a team", order: 1, videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        ],
      },
    ],
  },
];

export async function seedMatrials() {
  console.log("Start seeding matrials (Ranks, Courses, Lectures)...");

  for (const rankData of matrialsData) {
    const { courses, ...rank } = rankData;
    
    const seededRank = await prisma.ranks.upsert({
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

    for (const courseData of courses) {
      const { lectures, ...course } = courseData;
      
      const seededCourse = await prisma.courses.upsert({
        where: { title: course.title },
        update: {
          description: course.description,
          rankId: seededRank.id,
        },
        create: {
          title: course.title,
          description: course.description,
          rankId: seededRank.id,
        },
      });

      for (const lecture of lectures) {
        await prisma.lectures.upsert({
          where: {
            courseId_order: {
              courseId: seededCourse.id,
              order: lecture.order,
            },
          },
          update: {
            title: lecture.title,
            content: lecture.content,
            videoUrl: lecture.videoUrl,
          },
          create: {
            ...lecture,
            courseId: seededCourse.id,
          },
        });
      }
    }
  }
  
  console.log("Seeded matrials successfully.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedMatrials()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
    });
}
