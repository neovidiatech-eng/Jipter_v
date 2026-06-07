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
        title: "Data Structures",
        description: "Advanced Data Structures and Algorithms",
        lectures: [
          { title: "Introduction to Data Structures", content: "Overview of data structures", order: 1, duration: "1:30:00", date: new Date("2025-09-23T10:00:00Z"), videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", pdfUrl: "https://example.com/lecture1.pdf" },
          { title: "Session 2", content: "Arrays and Linked Lists", order: 2, duration: "1:30:00", date: new Date("2025-09-24T10:00:00Z"), videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", pdfUrl: "https://example.com/lecture2.pdf" },
          { title: "Session 3", content: "Stacks and Queues", order: 3, duration: "1:30:00", date: new Date("2025-09-25T10:00:00Z"), videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", pdfUrl: "https://example.com/lecture3.pdf" },
          { title: "Session 4", content: "Trees and Graphs", order: 4, duration: "1:30:00", date: new Date("2025-09-26T10:00:00Z"), videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", pdfUrl: "https://example.com/lecture4.pdf" },
          { title: "Session 5", content: "Hashing", order: 5, duration: "1:30:00", date: new Date("2025-09-27T10:00:00Z"), videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", pdfUrl: "https://example.com/lecture5.pdf" },
          { title: "Session 6", content: "Sorting Algorithms", order: 6, duration: "1:30:00", date: new Date("2025-09-28T10:00:00Z"), videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", pdfUrl: "https://example.com/lecture6.pdf" },
          { title: "Session 7", content: "Searching Algorithms", order: 7, duration: "1:30:00", date: new Date("2025-09-29T10:00:00Z"), videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", pdfUrl: "https://example.com/lecture7.pdf" },
          { title: "Session 8", content: "Advanced Topics", order: 8, duration: "1:30:00", date: new Date("2025-09-30T10:00:00Z"), videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", pdfUrl: "https://example.com/lecture8.pdf" },
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
            pdfUrl: lecture.pdfUrl,
            duration: lecture.duration,
            date: lecture.date,
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
