import * as db from "../../../database/dbService.js";

export const getDashboard = async ({ req, res, next }) => {
  const user = req.user;
  const student = await db.findFirst({
    model: "student",
    where: {
      user_id: user.id,
    },
    select: {
      id: true,
      birth_date: true,
      country: true,
      createdAt: true,
      sessions: true,
      sessions_attended: true,
      sessions_remaining: true,
      avgRating: true,
      totalReviews: true,
      rank: {
        select: {
          id: true,
          name: true,
          courses: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          gender: true,
          age: true,
        },
      },
      plan: {
        select: {
          id: true,
          name: true,
          sessionsCount: true,
          rescheduleCount: true,
          price: true,
          currency: {
            select: {
              symbol: true,
            },
          },
        },
      },
    },
  });

  const nextSchedule = await db.findFirst({
    model: "schedule",
    where: {
      AND: [
        { studentId: student.id },
        { start_time: { gte: new Date().toISOString() } },
      ],
    },
    orderBy: { start_time: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      notes: true,
      link: true,
      status: true,
      createdAt: true,
      platform: true,
      type: true,
      end_time: true,
      start_time: true,
      is_recurring: true,
      rescheduledFromId: true,
      rescheduledToId: true,
      teacher: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
            },
          },
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  student.joindate = student.createdAt;
  delete student.createdAt;

  return { metadata: student, nextSchedule };
};
