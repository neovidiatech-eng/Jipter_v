import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { seedPermissions } from "./permissionsSeeder.js";
import { seedTeachers } from "./teachers.seeder.js";
import { seedStudents } from "./student.seeder.js";
import { seedSchedules } from "./schedules.seeder.js";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function seedChat() {
  console.log("\n==========================================");
  console.log("🚀 Starting Chat & Conversations Seeding");
  console.log("==========================================\n");

  // Ensure prerequisite data exists
  await seedPermissions();
  await seedTeachers();
  await seedStudents();
  await seedSchedules();

  // Find Teacher & Student
  const teacherUser = await prisma.user.findUnique({
    where: { email: "ahmed.teacher@jipter.com" },
    include: { teacher: true },
  });

  const studentUser = await prisma.user.findUnique({
    where: { email: "john.doe@jipter.com" },
    include: { student: true },
  });

  if (!teacherUser || !teacherUser.teacher || !studentUser || !studentUser.student) {
    console.error("❌ Teacher or Student profile not found!");
    return;
  }

  const teacher = teacherUser.teacher;
  const student = studentUser.student;

  // 1. Create or Find Conversation
  let conversation = await prisma.conversation.findUnique({
    where: {
      teacherId_studentId: {
        teacherId: teacher.id,
        studentId: student.id,
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        teacherId: teacher.id,
        studentId: student.id,
        teacherUserId: teacherUser.id,
        studentUserId: studentUser.id,
      },
    });
    console.log(`✅ Created Conversation ID: ${conversation.id}`);
  } else {
    console.log(`ℹ️ Conversation already exists ID: ${conversation.id}`);
  }

  // 2. Clear old messages for clean test run
  await prisma.message.deleteMany({
    where: { conversationId: conversation.id },
  });

  // 3. Seed Sample Messages
  const sampleMessages = [
    {
      senderId: studentUser.id,
      content: "Hello Mr. Ahmed! Ready for our lesson today?",
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    },
    {
      senderId: teacherUser.id,
      content: "Hi John! Yes absolutely. Please check out the course syllabus image below.",
      createdAt: new Date(Date.now() - 1000 * 60 * 25),
    },
    {
      senderId: teacherUser.id,
      content: "Syllabus diagram",
      mediaUrl: "uploads/chat/sample-diagram.png",
      mediaType: "image",
      attachments: {
        originalname: "sample-diagram.png",
        mimetype: "image/png",
        size: 154200,
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 20),
    },
    {
      senderId: studentUser.id,
      content: null,
      mediaUrl: "uploads/chat/sample-voice-note.webm",
      mediaType: "voice",
      attachments: {
        originalname: "voice_note_12s.webm",
        mimetype: "audio/webm",
        duration: 12,
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      senderId: teacherUser.id,
      content: "Got your voice message! Here is the lesson homework PDF document.",
      mediaUrl: "uploads/chat/sample-homework.pdf",
      mediaType: "pdf",
      attachments: {
        originalname: "Lesson_1_Homework.pdf",
        mimetype: "application/pdf",
        size: 204800,
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
    },
  ];

  for (const msgData of sampleMessages) {
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        ...msgData,
      },
    });
  }
  console.log(`✅ Seeded ${sampleMessages.length} test messages.`);

  // 4. Generate JWT Tokens
  const secret = process.env.JWT_SECRET_ACCESS_ADMIN;
  const teacherToken = jwt.sign({ id: teacherUser.id }, secret, { expiresIn: "7d" });
  const studentToken = jwt.sign({ id: studentUser.id }, secret, { expiresIn: "7d" });

  console.log("\n==================================================");
  console.log("🎉 CHAT TEST DATA GENERATED SUCCESSFULLY");
  console.log("==================================================\n");
  console.log(`📌 Conversation ID: ${conversation.id}\n`);

  console.log("👤 STUDENT ACCOUNT:");
  console.log(`   Name:   ${studentUser.name}`);
  console.log(`   Email:  ${studentUser.email}`);
  console.log(`   User ID: ${studentUser.id}`);
  console.log(`   Token:  ${studentToken}\n`);

  console.log("👨‍🏫 TEACHER ACCOUNT:");
  console.log(`   Name:   ${teacherUser.name}`);
  console.log(`   Email:  ${teacherUser.email}`);
  console.log(`   User ID: ${teacherUser.id}`);
  console.log(`   Token:  ${teacherToken}\n`);

  console.log("==================================================");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedChat()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
    });
}
