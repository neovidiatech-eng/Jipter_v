import { connection, notificationQueue } from "../Radis/Connection.js";
import { Worker } from "bullmq";
import * as db from "../../database/dbService.js";
import { sendEmail } from "../Mailer/SendEmail.js";

export const addNotificationJob = async ({
  scheduleId,
  studentId,
  type,
  sendAt,
}) => {
  const job = await notificationQueue.add(
    "send-notification",
    { scheduleId, studentId, type },
    {
      jobId: scheduleId, // استخدام ID الجدول كـ ID للـ Job لسهولة المسح
      delay: Math.max(0, sendAt - new Date()),
    }, // الفارق بالمللي ثانية
  );
  console.log(`Added job with ID: ${job.id}`);
};

export const removeNotificationJob = async (scheduleId) => {
  const job = await notificationQueue.getJob(scheduleId);
  if (job) {
    await job.remove();
    console.log(`Removed job associated with schedule ${scheduleId}`);
  }
};

const worker = new Worker(
  "notifications",
  async (job) => {
    const { scheduleId, studentId, type } = job.data;

    console.log(
      `Sending ${type} notification to student ${studentId} for schedule ${scheduleId}`,
    );

    try {
      const schedule = await db.findFirst({
        model: "schedule",
        where: { id: scheduleId },
        include: {
          student: {
            include: { user: true },
          },
          teacher: {
            include: { user: true },
          },
        },
      });

      if (!schedule) {
        console.log(`Schedule with ID ${scheduleId} not found.`);
        return;
      }

      const title = schedule.title || "Session";
      const studentEmail = schedule.student?.user?.email;
      const studentName = schedule.student?.user?.name || "Student";
      
      const teacherEmail = schedule.teacher?.user?.email;
      const teacherName = schedule.teacher?.user?.name || "Teacher";

      const subject = `Reminder: Upcoming Session - ${title}`;
      const text = `This is a reminder that your session "${title}" is starting ${type}. Please be ready.`;

      if (studentEmail) {
        await sendEmail({
          email: studentEmail,
          subject,
          text,
          username: studentName,
          variant: "reminder"
        });
        console.log(`Email sent to student ${studentEmail}`);
      }

      if (teacherEmail) {
        await sendEmail({
          email: teacherEmail,
          subject,
          text,
          username: teacherName,
          variant: "reminder"
        });
        console.log(`Email sent to teacher ${teacherEmail}`);
      }
    } catch (error) {
      console.error("Failed to send notification email:", error);
    }
  },
  { connection },
);
