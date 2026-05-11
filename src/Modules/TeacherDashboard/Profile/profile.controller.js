import {
  asyncHandler,
  errorResponse,
  successResponse,
} from "../../../Utils/Response.js";
import { decryptText } from "../../../Utils/Security/index.js";
import * as db from "../../../database/dbService.js";

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
    user.schedules.reduce((acc, item) => {
      const student = item.student;
      if (!acc[student?.id]) {
        acc[student.id] = {
          id: student.id,
          name: student?.user.name,
          code: `STU-${student.id.slice(0, 3)}`,
          email: student.user.email,
          phone: `${student.user.code_country}${student.user.phone}`,
          subject: {
            name: item.subject.name_en,
            code: `SUB-${item.subject.id.slice(0, 3)}`,
          },
          sessions: `${student.sessions_attended}/${student.sessions}`,
        };
      }
      return acc;
    }, {}),
  );

  const mapped = {
    teacher: {
      id: user.id,
      user_id: user.user_id,
      name: user.user.name,
      email: user.user.email,
      phone: `${user.user.code_country} ${user.user.phone}`, // ✅ استخدم الـ decrypted phone
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
      startTime: s.start_time,
      endTime: s.end_time,
      isRecurring: s.is_recurring,
      link: s.link,
      notes: s.notes,
      subject: {
        nameEn: s.subject.name_en,
        nameAr: s.subject.name_ar,
        color: s.subject.color,
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
