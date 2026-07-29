import * as db from "../../../database/dbService.js";
import { toLocal } from "../../../Utils/Date/time.js";

export const getDashboard = async ({ req, res, next }) => {
  const user = req.user;

  const student = await db.findFirst({
    model: "student",
    where: {
      user_id: user.id,
    },
    select: {
      id: true,
      user_id: true,
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
          color:true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          gender: true,
          age: true,
          reviewsReceived: true,
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
      lectures: {
        select: {
          id: true,
          title: true,
          order: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  const userLectures = await db.findMany({
    model: "user_lectures",
    where: {
      userId: student.user_id,
    },
    select: {
      id: true,
      status: true,
      progress: true,
      completedAt: true,
      lectureId: true,
      lecture: {
        select: {
          id: true,
          title: true,
          order: true,
          courseId: true,
        },
      },
    },
  });


  const userCourseIds = userLectures
    .map((ul) => ul.lecture?.courseId)
    .filter(Boolean);

  const courseWhere = student?.rank?.id
    ? {
        OR: [
          { rankId: student.rank.id },
          ...(userCourseIds.length ? [{ id: { in: userCourseIds } }] : []),
        ],
      }
    : {};

  const courses = await db.findMany({
    model: "courses",
    where: courseWhere,
    select: {
      id: true,
      title: true,
      description: true,
      image: true,
      lectures: {
        select: {
          id: true,
          title: true,
          order: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });

  const userLectureMap = new Map();
  for (const ul of userLectures) {
    userLectureMap.set(ul.lectureId, ul);
  }

  const studentProgress = courses.map((course) => {
    const totalLectures = course.lectures.length;
    let completedLectures = 0;

    const lectures = course.lectures.map((lecture) => {
      const ul = userLectureMap.get(lecture.id);
      const isCompleted = ul?.status === "completed";
      if (isCompleted) {
        completedLectures++;
      }

      return {
        id: lecture.id,
        title: lecture.title,
        order: lecture.order,
        status: ul?.status || "not_started",
        progress: ul?.progress || 0,
        completedAt: ul?.completedAt || null,
      };
    });

    const progressPercentage =
      totalLectures > 0
        ? Math.round((completedLectures / totalLectures) * 100)
        : 0;

    return {
      courseId: course.id,
      courseTitle: course.title,
      courseDescription: course.description,
      courseImage: course.image,
      totalLectures,
      completedLectures,
      progressPercentage,
    };
  });

  student.joindate = student.createdAt;
  delete student.createdAt;

  if (nextSchedule) {
    nextSchedule.start_time = toLocal(nextSchedule.start_time, req.timezone);
    nextSchedule.end_time = toLocal(nextSchedule.end_time, req.timezone);
  }

  return { metadata: student, nextSchedule, studentProgress };
};
