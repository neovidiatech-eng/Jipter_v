import {
  asyncHandler,
  errorResponse,
  successResponse,
} from "../../../Utils/Response.js";
import { decryptText } from "../../../Utils/Security/index.js";
import * as db from "../../../database/dbService.js";
import { toLocal } from "../../../Utils/Date/time.js";

export const getProfile = asyncHandler(async (req, res, next) => {
  const user = await db.findOne({
    model: "teacher",
    where: { user_id: req.user.id },
    include: {
      user: {
        include: {
          wallet: {
            include: {
              transactions: {
                orderBy: { createdAt: "desc" },
              },
              currency: true,
            },
          },
        },
      },
      schedules: {
        include: {
          teacher: true,
          student: { include: { user: true } },
          course: true,
        },
      },
    },
  });

  if (!user) {
    return errorResponse({
      next,
      req,
      status: 404,
      message: "TEACHER_NOT_FOUND",
    });
  }

  const students = Object.values(
    await user.schedules.reduce(async (accPromise, item) => {
      const acc = await accPromise;
      const student = item.student;
      if (!acc[student?.id]) {
        acc[student.id] = {
          id: student.id,
          name: student?.user.name,
          code: `STU-${student.id.slice(0, 3)}`,
          email: student.user.email,
          phone: `${student.user.code_country}${await decryptText({ text: student.user.phone })}`,
          course: {
            title: item.course.title,
            id: item.course.id,
          },
          sessions: `${student.sessions_attended}/${student.sessions}`,
        };
      }
      return acc;
    }, Promise.resolve({})),
  );

  const mapped = {
    teacher: {
      id: user.id,
      user_id: user.user_id,
      name: user.user.name,
      email: user.user.email,
      phone: `${user.user.code_country} ${await decryptText({ text: user.user.phone })}`, // ✅ استخدم الـ decrypted phone
      gender: user.gender,
      hourPrice: user.hour_price,
      status: user.user.status,
      active: user.active,
      wallet: user.user.wallet,
    },
    stats: {
      totalStudents: students.length,
      totalSessions: user.schedules.length,
    },
    schedules: user.schedules.map((s) => ({
      title: s.title,
      description: s.description,
      type: s.type,
      status: s.status,
      startTime: toLocal(s.start_time, req.timezone),
      endTime: toLocal(s.end_time, req.timezone),
      isRecurring: s.is_recurring,
      link: s.link,
      notes: s.notes,
      course: {
        title: s.course.title,
        id: s.course.id,
      },
      student: {
        name: s.student.user.name,
        email: s.student.user.email,
        gender: s.student.gender,
        country: s.student.country,
        status: s.student.status,
        sessions: {
          total: s.student.sessions,
          attended: s.student.sessions_attended,
          remaining: s.student.sessions_remaining,
        },
      },
    })),
    students, // ✅ الطلاب الـ unique
  };

  return successResponse({
    res,
    req,
    data: mapped,
    status: 200,
    message: "FETCH_SUCCESS",
  });
});
export const getMyStudents = asyncHandler(async (req, res, next) => {
  const teacher = req.user.teacher;

  const myStudents = await db.findMany({
    model: "schedule",
    where: {
      teacherId: teacher?.id,
    },
    include: {
      student: {
        include: {
          user: true,
        },
      },
      teacher: {
        include: {
          user: true,
        },
      },
    },
  });

  const students = Object.values(
    await myStudents.reduce(async (accPromise, item) => {
      const acc = await accPromise;
      const student = item.student;

      if (!acc[student.id]) {
        acc[student.id] = {
          id: student.id,
          user_id: student.user.id,
          name: student.user.name,
          code: `STU-${student.id.slice(0, 3)}`,
          email: student.user.email,
          phone: `${student.user.code_country}${await decryptText({ text: student.user.phone })}`,
          sessions: `${student.sessions_attended}/${student.sessions}`,
        };
      }

      return acc;
    }, Promise.resolve({})),
  );
  return successResponse({
    res,
    req,
    message: "FETCH_SUCCESS",
    data: students,
  });
});
