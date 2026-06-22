import {
  asyncHandler,
  successResponse,
  errorResponse,
} from "../../Utils/Response.js";
import {
  checkExist,
  getDatesBetweenUTC,
  combineDateAndTime,
  getEndTime,
  normalizeDate,
} from "../../Utils/Helpers.js";
import { nanoid } from "nanoid";
import { decryptText } from "../../Utils/Security/index.js";

import * as db from "../../database/dbService.js";
import { notificationType } from "../../Utils/Enums/sessions.js";
import {
  addNotificationJob,
  removeNotificationJob,
} from "../../Utils/Workers/notifications.js";
import {
  getNowUTC,
  isBeforeAllowedJoinTime,
  isInsideJoinWindow,
  toLocal,
} from "../../Utils/Date/time.js";
import { settleTeacherReview } from "./sessionSettlement.service.js";
import dayjs from "dayjs";

/* ------------------------------------------------------------------ */
/*            Admin creates multiple sessions in one request            */
/* ------------------------------------------------------------------ */
export const getAllSchedules = asyncHandler(async (req, res, next) => {
  const { search, start_date, end_date, page = 1, limit = 10 } = req.query;

  const where = {};
  if (search) {
    where.OR = [
      {
        student: {
          user: {
            name: { contains: search, mode: "insensitive" },
          },
        },
      },
      {
        teacher: {
          user: {
            name: { contains: search, mode: "insensitive" },
          },
        },
      },
    ];
  }

  // 📅 فلترة بالتاريخ
  if (start_date && end_date) {
    where.start_time = {
      gte: normalizeDate(start_date),
      lte: normalizeDate(end_date),
    };
  }

  const { items: schedule, pagination } =
    await db.findManyWithPaginationAndCount({
      model: "schedule",
      where,
      page,
      limit,
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                code_country: true,
              },
            },
          },
        },
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                code_country: true,
              },
            },
          },
        },
      },
    });
  const scheduleData = await Promise.all(
    schedule.map(async (schedule) => {
      if (schedule.student?.user?.phone) {
        schedule.student.user.phone = await decryptText({
          text: schedule.student.user.phone,
        });
      }
      if (schedule.teacher?.user?.phone) {
        schedule.teacher.user.phone = await decryptText({
          text: schedule.teacher.user.phone,
        });
      }
      return {
        ...schedule,
        start_time: toLocal(schedule.start_time, req.timezone),
        end_time: toLocal(schedule.end_time, req.timezone),
      };
    }),
  );
  const now = getNowUTC();
  const nowTime = now.toDate().getTime();
  const tz = req.timezone;

  const previousSchedule = scheduleData.filter((s) => {
    return new Date(s.end_time).getTime() < nowTime;
  });

  const upcomingSchedule = scheduleData.filter((s) => {
    return new Date(s.start_time).getTime() > nowTime;
  });

  const todayStr = now.tz(tz).format("YYYY-MM-DD");
  const toDaySchedule = scheduleData.filter((s) => {
    return s.start_time.split(" ")[0] === todayStr;
  });

  return successResponse({
    res,
    req,
    data: {
      schedule: { upcomingSchedule, toDaySchedule, previousSchedule },
      pagination,
    },
    status: 200,
    message: "FETCH_SUCCESS",
  });
});
export const getScheduleById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const schedule = await db.findOne({
    model: "schedule",
    where: { id },
    include: {
      student: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              code_country: true,
            },
          },
        },
      },
      teacher: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              code_country: true,
            },
          },
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          lectures: {
            select: {
              title: true,
              content: true,
              videoUrl: true,
              pdfUrl: true,
              date: true,
              order: true,
            },
          },
        },
      },
      scheduleLogs: true,
    },
  });
  if (schedule?.student?.user?.phone) {
    schedule.student.user.phone = await decryptText({
      text: schedule.student.user.phone,
    });
  }
  if (schedule?.teacher?.user?.phone) {
    schedule.teacher.user.phone = await decryptText({
      text: schedule.teacher.user.phone,
    });
  }

  const scheduleData = {
    ...schedule,
    start_time: toLocal(schedule?.start_time, req.timezone),
    end_time: toLocal(schedule?.end_time, req.timezone),
  };

  return successResponse({
    res,
    req,
    data: {
      schedule: scheduleData,
    },
    status: 200,
    message: "FETCH_SUCCESS",
  });
});
export const createSchedule = asyncHandler(async (req, res, next) => {
  const {
    studentId,
    teacherId,
    courseId,
    title,
    description,
    link,
    notification_Time,
    notes,
    date,
    start_time,
    platform,
    type,
    language,
    videoUrl,
    slidesUrl,
  } = req.body;
  /* check if student, teacher and course exist */
  const [student, teacher, course] = await Promise.all([
    db.findOne({
      model: "student",
      where: { id: studentId },
      include: { plan: true },
    }),
    checkExist({ model: "teacher", where: { id: teacherId }, next }),
    checkExist({
      model: "courses",
      where: { id: courseId },
      next,
      include: { lectures: { orderBy: { order: "asc" } } },
    }),
  ]);

  if (!student) {
    return errorResponse({
      req,
      next,
      status: 404,
      message: "STUDENT_NOT_FOUND",
    });
  }
  if (!course) {
    return errorResponse({
      req,
      next,
      status: 404,
      message: "COURSE_NOT_FOUND",
    });
  }
  if (!teacher) {
    return errorResponse({
      req,
      next,
      status: 403,
      message: "TEACHER_NOT_FOUND",
    });
  }

  const tz = req.timezone;
  const startTime = normalizeDate(start_time, tz);
  const endTime = getEndTime(startTime, type, student.plan?.sessionTime);

  /* check if student and teacher are available at the same time */
  const [studentSchedule, teacherSchedule] = await Promise.all([
    db.findFirst({
      model: "schedule",
      where: {
        studentId,
        start_time: { lt: endTime },
        end_time: { gt: startTime },
      },
    }),

    db.findFirst({
      model: "schedule",
      where: {
        teacherId,
        status: { not: "cancelled" },
        start_time: { lt: endTime },
        end_time: { gt: startTime },
      },
    }),
  ]);

  if (studentSchedule) {
    return errorResponse({
      req,
      next,
      status: 409,
      message: "STUDENT_CONFLICT",
      messageParams: { title: studentSchedule.title },
    });
  }

  if (teacherSchedule) {
    return errorResponse({
      req,
      next,
      status: 409,
      message: "TEACHER_CONFLICT",
      messageParams: { title: teacherSchedule.title },
    });
  }

  // Session check
  const requiredSessions = 1;
  if (student.sessions_remaining < requiredSessions) {
    return errorResponse({
      req,
      next,
      status: 400,
      message: "INSUFFICIENT_SESSIONS",
      messageParams: { remaining: student.sessions_remaining },
    });
  }

  // Atomically create the schedule and deduct the session
  let newSchedule;
  await db.transaction(async (tx) => {
    newSchedule = await tx.create({
      model: "schedule",
      data: {
        studentId,
        teacherId,
        title,
        platform,
        description,
        link,
        notes,
        courseId,
        start_time: startTime,
        lecturesId: course.lectures[0]?.id || null,
        order: course.lectures[0]?.order || 0,
        end_time: endTime,
        type,
        language,
        videoUrl: videoUrl || course.lectures[0]?.videoUrl || null,
        slidesUrl,
      },
    });

    await tx.updateOne({
      model: "student",
      where: { id: studentId },
      data: { sessions_remaining: { decrement: requiredSessions } },
    });
  });

  let reminderTime;
  let notificationJobType;
  if (notification_Time === notificationType[1]) {
    reminderTime = new Date(startTime.getTime() - 10 * 60 * 1000);
    notificationJobType = "before 10 minutes";
  } else if (notification_Time === notificationType[2]) {
    reminderTime = new Date(startTime.getTime() - 30 * 60 * 1000);
    notificationJobType = "before 30 minutes";
  } else if (notification_Time === notificationType[3]) {
    reminderTime = new Date(startTime.getTime() - 60 * 60 * 1000);
    notificationJobType = "before 60 minutes";
  } else{
    reminderTime = new Date(startTime.getTime() - 5 * 60 * 1000);
    notificationJobType = "before 5 minutes";
  }

  const now = new Date();
  if (startTime > now) {
    addNotificationJob({
      scheduleId: newSchedule.id,
      studentId,
      type: notificationJobType,
      sendAt: reminderTime,
    });
  }

  return successResponse({
    res,
    req,
    data: {
      schedule: {
        ...newSchedule,
        start_time: toLocal(newSchedule.start_time, tz),
        end_time: toLocal(newSchedule.end_time, tz),
      },
    },
    status: 201,
    message: "CREATE_SUCCESS",
  });
});

/* ------------------------------------------------------------------ */
/*            Admin creates recurring sessions in one request           */
/* ------------------------------------------------------------------ */
export const createRecurringSchedule = asyncHandler(async (req, res, next) => {
  const {
    studentId,
    teacherId,
    courseId,
    title,
    description,
    link,
    notes,
    type,
    startTime: timeStart, // "HH:mm"
    days, // ["Saturday", ...]
    startDate, // "2026-03-26"
    endDate, // "2026-04-26"
    notification_Time,
    language,
    videoUrl,
    slidesUrl,
  } = req.body;
  const skipedSchedules = [];
  const perSessionUnits = 1;

  /* check exist student, teacher, course */
  const [student, teacher, course] = await Promise.all([
    db.findOne({
      model: "student",
      where: { id: studentId },
      include: { plan: true },
    }),
    checkExist({ model: "teacher", where: { id: teacherId }, next }),
    checkExist({
      model: "courses",
      where: { id: courseId },
      next,
      include: { lectures: { orderBy: { order: "asc" } } },
    }),
  ]);

  if (!student) {
    return errorResponse({
      req,
      next,
      status: 404,
      message: "STUDENT_NOT_FOUND",
    });
  }

  const dates = getDatesBetweenUTC(startDate, endDate, days);

  // Session check for recurring
  const totalPotentialSessions = dates.length * perSessionUnits;
  if (student.sessions_remaining < totalPotentialSessions) {
    return errorResponse({
      req,
      next,
      status: 400,
      message: "INSUFFICIENT_SESSIONS_RECURRING",
      messageParams: {
        length: dates.length,
        required: totalPotentialSessions,
        remaining: student.sessions_remaining,
      },
    });
  }

  const createdSchedules = [];
  const schedulesToCreate = [];
  const notificationJobs = [];
  const parentRecurringId = `rec_${nanoid(10)}`;

  const tz = req.timezone;
  const allDatesStart = dates.map((d) => {
    return combineDateAndTime(d, timeStart, tz);
  });
  // Determine the overall window for the batch conflict query
  const windowStart = allDatesStart[0];
  const lastDate = allDatesStart[allDatesStart.length - 1];
  const windowEnd = getEndTime(lastDate, type, student.plan?.sessionTime);

  // Pre-fetch ALL conflicts in 2 queries instead of 2-per-date (N+1 fix)
  const [allTeacherConflicts, allStudentConflicts] = await Promise.all([
    db.findMany({
      model: "schedule",
      where: {
        teacherId,
        status: { not: "cancelled" },
        start_time: { lt: windowEnd },
        end_time: { gt: windowStart },
      },
      select: { id: true, start_time: true, end_time: true, title: true },
    }),
    db.findMany({
      model: "schedule",
      where: {
        studentId,
        status: { not: "cancelled" },
        start_time: { lt: windowEnd },
        end_time: { gt: windowStart },
      },
      select: { id: true, start_time: true, end_time: true, title: true },
    }),
  ]);

  for (const date of dates) {
    const start_time = combineDateAndTime(date, timeStart, tz);

    const end_time = getEndTime(start_time, type, student.plan?.sessionTime);

    // In-memory overlap check (avoids DB query per iteration)
    const teacher_conflict = allTeacherConflicts.find(
      (s) => s.start_time < end_time && s.end_time > start_time,
    );
    const student_conflict = allStudentConflicts.find(
      (s) => s.start_time < end_time && s.end_time > start_time,
    );

    if (student_conflict) {
      skipedSchedules.push({
        date: date.toISOString().split("T")[0],
        title: student_conflict.title,
        conflict: "STUDENT_CONFLICT",
      });
      continue;
    }
    if (teacher_conflict) {
      skipedSchedules.push({
        date: date.toISOString().split("T")[0],
        title: teacher_conflict.title,
        conflict: "TEACHER_CONFLICT",
      });
      continue;
    }

    const lectureIndex =
      schedulesToCreate.length % (course.lectures.length || 1);
    const currentLecture = course.lectures[lectureIndex];

    schedulesToCreate.push({
      studentId,
      order: currentLecture?.order || 0,
      teacherId,
      title: currentLecture?.title || title,
      description,
      link,
      pdfUrl: currentLecture?.pdfUrl || null,
      notes,
      start_time,
      end_time,
      courseId,
      lecturesId: currentLecture?.id || null,
      is_recurring: true,
      day_of_week: date.toLocaleDateString("en-US", { weekday: "long" }),
      parent_recurring_id: parentRecurringId,
      language,
      videoUrl: currentLecture?.videoUrl || videoUrl || null,
      slidesUrl: currentLecture?.slidesUrl || slidesUrl || null,
    });

    notificationJobs.push({ start_time, notification_Time });
  }

  // Atomically create all valid schedules + deduct sessions in one transaction
  if (schedulesToCreate.length > 0) {
    await db.transaction(async (tx) => {
      for (const scheduleData of schedulesToCreate) {
        const schedule = await tx.create({
          model: "schedule",
          data: scheduleData,
        });
        createdSchedules.push({
          id: schedule.id,
          date: scheduleData.start_time.toISOString().split("T")[0],
          start_time: scheduleData.start_time.toISOString(),
        });
      }

      await tx.updateOne({
        model: "student",
        where: { id: studentId },
        data: {
          sessions_remaining: {
            decrement: createdSchedules.length * perSessionUnits,
          },
        },
      });
    });

    // Queue notification jobs after successful transaction
    const now = new Date();
    for (let i = 0; i < notificationJobs.length; i++) {
      const { start_time: st, notification_Time: nt } = notificationJobs[i];
      let reminderTime;
      let notificationJobType;
      if (nt === notificationType[1]) {
        reminderTime = new Date(st.getTime() - 10 * 60 * 1000);
        notificationJobType = "before 10 minutes";
      } else if (nt === notificationType[2]) {
        reminderTime = new Date(st.getTime() - 30 * 60 * 1000);
        notificationJobType = "before 30 minutes";
      } else if (nt === notificationType[3]) {
        reminderTime = new Date(st.getTime() - 60 * 60 * 1000);
        notificationJobType = "before 60 minutes";
      } else {
        reminderTime = new Date(st.getTime() - 5 * 60 * 1000);
        notificationJobType = "before 5 minutes";
      }
      
      if (st > now) {
        addNotificationJob({
          scheduleId: createdSchedules[i]?.id,
          studentId,
          type: notificationJobType,
          sendAt: reminderTime,
        });
      }
    }
  }

  return successResponse({
    res,
    req,
    status: 201,
    message: createdSchedules.length
      ? "RECURRING_CREATE_SUCCESS"
      : "RECURRING_CREATE_WITH_CONFLICTS",
    messageParams: { length: skipedSchedules.length },
    data: { conflicts: skipedSchedules },
  });
});

/* ------------------------------------------------------------------ */
/*             Get all schedules (teacher dashboard / admin)            */
/* ------------------------------------------------------------------ */
export const getUserSchedules = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { status, search } = req.query;

  const where = {};
  if (status) where.status = status;

  // Handle filtering based on user role
  if (user.role?.name?.toLowerCase() === "teacher") {
    const teacher = user.teacher;
    if (!teacher) {
      return errorResponse({
        req,
        next,
        status: 404,
        message: "TEACHER_NOT_FOUND",
      });
    }
    where.teacherId = teacher.id;
  } else if (user.role?.name?.toLowerCase() === "student") {
    const student = user.student;
    if (!student) {
      return errorResponse({
        req,
        next,
        status: 404,
        message: "STUDENT_NOT_FOUND",
      });
    }
    where.studentId = student.id;
  }

  if (search) {
    if (where.teacherId) {
      // If teacher is viewing, search by student name
      where.student = {
        user: {
          name: { contains: search, mode: "insensitive" },
        },
      };
    } else if (where.studentId) {
      // If student is viewing, search by teacher name
      where.teacher = {
        user: {
          name: { contains: search, mode: "insensitive" },
        },
      };
    } else {
      // If admin, search by both
      where.OR = [
        {
          student: {
            user: { name: { contains: search, mode: "insensitive" } },
          },
        },
        {
          teacher: {
            user: { name: { contains: search, mode: "insensitive" } },
          },
        },
      ];
    }
  }

  const schedules = await db.findMany({
    model: "schedule",
    where,
    include: {
      student: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              code_country: true,
            },
          },
        },
      },
      teacher: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              code_country: true,
            },
          },
        },
      },
      course: {
        select: {
          lectures: true,
        },
      },
    },
    orderBy: { start_time: "asc" },
  });

  const schedulesData = await Promise.all(
    schedules.map(async (s) => {
      if (s.student?.user?.phone) {
        s.student.user.phone = await decryptText({
          text: s.student.user.phone,
        });
      }
      if (s.teacher?.user?.phone) {
        s.teacher.user.phone = await decryptText({
          text: s.teacher.user.phone,
        });
      }
      return {
        ...s,
        start_time: toLocal(s.start_time, req.timezone),
        end_time: toLocal(s.end_time, req.timezone),
      };
    }),
  );

  const now = getNowUTC();
  const nowTime = now.toDate().getTime();
  const tz = req.timezone;

  const previousSchedule = schedulesData.filter((s) => {
    return new Date(s.end_time).getTime() < nowTime;
  });

  const upcomingSchedule = schedulesData.filter((s) => {
    return new Date(s.start_time).getTime() > nowTime;
  });

  const todayStr = now.tz(tz).format("YYYY-MM-DD");
  const toDaySchedule = schedulesData.filter((s) => {
    return s.start_time.split(" ")[0] === todayStr;
  });

  return successResponse({
    res,
    req,
    status: 200,
    message: "FETCH_SUCCESS",
    data: { upcomingSchedule, toDaySchedule, previousSchedule },
  });
});

/* ------------------------------------------------------------------ */
/*                  Delete a single session & its job                   */
/* ------------------------------------------------------------------ */
export const deleteSchedule = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const schedule = await db.findFirst({
    model: "schedule",
    where: { id },
  });

  if (!schedule) {
    return errorResponse({
      req,
      next,
      status: 404,
      message: "SESSION_NOT_FOUND",
    });
  }

  // Removal job from BullMQ
  await removeNotificationJob(id);

  // 🛡️ Use transaction to ensure refund and deletion happen together
  await db.transaction(async (tx) => {
    // Refund sessions if it wasn't already cancelled
    if (schedule.status !== "cancelled") {
      const refundSessions = 1;
      await tx.updateOne({
        model: "student",
        where: { id: schedule.studentId },
        data: { sessions_remaining: { increment: refundSessions } },
      });
    }

    // Delete from DB
    await tx.deleteOne({
      model: "schedule",
      where: { id: id },
    });
  });

  return successResponse({
    res,
    req,
    status: 200,
    message: "DELETE_SUCCESS",
  });
});

/* ------------------------------------------------------------------ */
/*              Delete a recurring group & all its jobs                 */
/* ------------------------------------------------------------------ */
export const deleteRecurringGroup = asyncHandler(async (req, res, next) => {
  const { parent_recurring_id } = req.params;

  const schedules = await db.findMany({
    model: "schedule",
    where: { parent_recurring_id },
    select: { id: true },
  });

  const sessionsCount = schedules.length;

  if (!sessionsCount) {
    return errorResponse({
      req,
      next,
      status: 404,
      message: "RECURRING_GROUP_NOT_FOUND",
    });
  }

  // Remove all jobs
  await Promise.all(schedules.map((s) => removeNotificationJob(s.id)));

  // Refund sessions for sessions that weren't already cancelled
  const sessionsToRefund = await db.findMany({
    model: "schedule",
    where: { parent_recurring_id, status: { not: "cancelled" } },
    select: { id: true },
  });

  // 🛡️ Use transaction to ensure refund and mass deletion happen together
  await db.transaction(async (tx) => {
    if (sessionsToRefund.length > 0) {
      const totalRefund = sessionsToRefund.length;
      const firstSchedule = await tx.findFirst({
        model: "schedule",
        where: { parent_recurring_id },
      });

      if (firstSchedule) {
        await tx.updateOne({
          model: "student",
          where: { id: firstSchedule.studentId },
          data: { sessions_remaining: { increment: totalRefund } },
        });
      }
    }

    // Delete all sessions
    await tx.deleteMany({
      model: "schedule",
      where: { parent_recurring_id },
    });
  });

  return successResponse({
    res,
    req,
    status: 200,
    message: "RECURRING_DELETE_SUCCESS",
    messageParams: { length: schedules.length },
  });
});

/* ------------------------------------------------------------------ */
/*                  Update a single session & its job                   */
/* ------------------------------------------------------------------ */
export const updateSchedule = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { start_time, type, notification_Time, ...otherData } = req.body;

  const schedule = await db.findOne({
    model: "schedule",
    where: { id },
    include: { student: { include: { plan: true } } },
  });

  if (!schedule) {
    return errorResponse({
      req,
      next,
      status: 404,
      message: "SESSION_NOT_FOUND",
    });
  }

  let startTime = schedule.start_time;
  let endTime = schedule.end_time;
  let sessionType = schedule.type;
  let scheduleUpdated = false;

  const updateData = { ...otherData };

  // If time or type changes, recalculate end time and check conflicts
  if (start_time || type) {
    startTime = start_time
      ? normalizeDate(start_time, req.timezone)
      : startTime;
    sessionType = type || sessionType;
    endTime = getEndTime(
      startTime,
      sessionType,
      schedule.student.plan?.sessionTime,
    );

    updateData.start_time = startTime;
    updateData.end_time = endTime;
    updateData.type = sessionType;
    scheduleUpdated = true;

    // Conflict check
    const teacher_conflict = await db.findFirst({
      model: "schedule",
      where: {
        teacherId: schedule.teacherId,
        id: { not: id },
        start_time: { lt: endTime },
        end_time: { gt: startTime },
      },
    });
    const student_conflict = await db.findFirst({
      model: "schedule",
      where: {
        studentId: schedule.studentId,
        id: { not: id },
        start_time: { lt: endTime },
        end_time: { gt: startTime },
      },
    });

    if (teacher_conflict || student_conflict) {
      return errorResponse({
        req,
        next,
        status: 409,
        message: "SESSION_CONFLICT",
      });
    }
  }

  // Handle session adjustments for status change
  if (otherData.status && otherData.status !== schedule.status) {
    const sessionUnits = 1;
    if (otherData.status === "cancelled") {
      // Refund
      await db.updateOne({
        model: "student",
        where: { id: schedule.studentId },
        data: { sessions_remaining: { increment: sessionUnits } },
      });
    } else if (schedule.status === "cancelled") {
      // Restoring: Deduct
      if (schedule.student.sessions_remaining < sessionUnits) {
        return errorResponse({
          req,
          next,
          status: 400,
          message: "INSUFFICIENT_SESSIONS_RESTORE",
        });
      }
      await db.updateOne({
        model: "student",
        where: { id: schedule.studentId },
        data: { sessions_remaining: { decrement: sessionUnits } },
      });
    }
  }

  // Adjust sessions if type changed (no longer affects session units but keeping logic structure)
  // Since 1 session = 1 unit regardless of type, no unit adjustment needed on type change.

  const updatedSchedule = await db.updateOne({
    model: "schedule",
    where: { id },
    data: updateData,
  });

  // Handle notification job update
  if (scheduleUpdated || notification_Time || otherData.status) {
    await removeNotificationJob(id);

    // Only add a new job if the session is still "planned"
    const currentStatus = otherData.status || updatedSchedule.status;
    if (currentStatus === "planned") {
      const effectiveNotificationTime = notification_Time || "60";

      let reminderTime;
      let notificationJobType;
      if (effectiveNotificationTime === notificationType[1]) {
        reminderTime = new Date(startTime.getTime() - 10 * 60 * 1000);
        notificationJobType = "before 10 minutes";
      } else if (effectiveNotificationTime === notificationType[2]) {
        reminderTime = new Date(startTime.getTime() - 30 * 60 * 1000);
        notificationJobType = "before 30 minutes";
      } else {
        reminderTime = new Date(startTime.getTime() - 60 * 60 * 1000);
        notificationJobType = "before 60 minutes";
      }

      const now = new Date();
      if (reminderTime > now) {
        addNotificationJob({
          scheduleId: id,
          studentId: schedule.studentId,
          type: notificationJobType,
          sendAt: reminderTime,
        });
      }
    }
  }

  return successResponse({
    res,
    req,
    status: 200,
    message: "UPDATE_SUCCESS",
    data: {
      ...updatedSchedule,
      start_time: toLocal(updatedSchedule.start_time, req.timezone),
      end_time: toLocal(updatedSchedule.end_time, req.timezone),
    },
  });
});

/* ------------------------------------------------------------------ */
/*                      Session Lifecycle Logic                        */
/* ------------------------------------------------------------------ */

export const joinSession = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  const role = user.role?.name?.toLowerCase();

  const session = await db.findOne({ model: "schedule", where: { id } });
  if (!session) {
    return errorResponse({
      req,
      next,
      status: 404,
      message: "SESSION_NOT_FOUND",
    });
  }

  if (session.status === "cancelled") {
    return errorResponse({
      req,
      next,
      status: 400,
      message: "SESSION_CANCELLED",
    });
  }

  // 1. Check if it's too early (UTC comparison)
  if (isBeforeAllowedJoinTime(session.start_time, 5)) {
    return errorResponse({
      req,
      next,
      status: 400,
      message: "TOO_EARLY_TO_JOIN",
      messageParams: {
        now: toLocal(getNowUTC(), req.timezone),
        start: toLocal(session.start_time, req.timezone),
      },
    });
  }

  // 2. Check if it's already finished (UTC comparison)
  const now = getNowUTC();
  const endTime = dayjs.utc(session.end_time);
  if (now.isAfter(endTime) || now.isSame(endTime)) {
    return errorResponse({
      req,
      next,
      status: 400,
      message: "SESSION_ALREADY_FINISHED",
    });
  }

  const nowUTC = getNowUTC().toDate();

  // Get or Create Log
  let log = await db.findFirst({
    model: "scheduleLog",
    where: { scheduleId: id },
  });
  if (!log) {
    log = await db.create({
      model: "scheduleLog",
      data: { scheduleId: id },
    });
  }

  const updateData = {};
  if (role === "student") {
    updateData.joinTime_student = nowUTC;
  } else if (role === "teacher") {
    updateData.joinTime_teacher = nowUTC;
    if (nowUTC > new Date(session.start_time.getTime() + 10 * 60 * 1000)) {
      updateData.isTeacherLate = true;
      // Notify Admin (Simple record in notification table)
      await db.create({
        model: "notification",
        data: {
          userId: "admin", // Placeholder or fetch actual admin
          title: req.t("NOTIFICATION_TEACHER_LATE_TITLE"),
          message: req.t("NOTIFICATION_TEACHER_LATE_MSG", { id }),
          type: "teacher_late",
        },
      });
    }
  }

  await db.updateOne({
    model: "scheduleLog",
    where: { id: log.id },
    data: updateData,
  });

  if (session.status === "scheduled") {
    await db.updateOne({
      model: "schedule",
      where: { id },
      data: { status: "ongoing" },
    });
  }

  // Notify other party
  const targetUserId =
    role === "student" ? session.teacherId : session.studentId;
  const targetUser = await db.findOne({
    model: role === "student" ? "teacher" : "student",
    where: { id: targetUserId },
    include: { user: true },
  });

  if (targetUser?.user?.id) {
    await db.create({
      model: "notification",
      data: {
        userId: targetUser.user.id,
        title: req.t("NOTIFICATION_SESSION_JOINED_TITLE"),
        message: req.t("NOTIFICATION_SESSION_JOINED_MSG", {
          role: role === "student" ? req.t("STUDENT") : req.t("TEACHER"),
        }),
        type: "session_joined",
      },
    });
  }

  return successResponse({ res, req, status: 200, message: "JOINED_SUCCESS" });
});

export const leaveSession = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  const role = user.role?.name?.toLowerCase();

  const log = await db.findFirst({
    model: "scheduleLog",
    where: { scheduleId: id },
    include: { schedule: true },
  });

  if (!log) {
    return errorResponse({ req, next, status: 404, message: "LOG_NOT_FOUND" });
  }

  const session = log.schedule;
  const nowUTC = getNowUTC().toDate();
  const updateData = {};

  if (role === "student") {
    if (!log.joinTime_student)
      return errorResponse({ req, next, status: 400, message: "NEVER_JOINED" });
    updateData.leaveTime_student = nowUTC;
    const duration = (nowUTC - log.joinTime_student) / 60000;
    updateData.duration_student = duration;
  } else if (role === "teacher") {
    if (!log.joinTime_teacher)
      return errorResponse({ req, next, status: 400, message: "NEVER_JOINED" });
    updateData.leaveTime_teacher = nowUTC;
    const duration = (nowUTC - log.joinTime_teacher) / 60000;
    updateData.duration_teacher = duration;
  }

  await db.updateOne({
    model: "scheduleLog",
    where: { id: log.id },
    data: updateData,
  });

  // If session end time passed, finalize
  if (nowUTC >= session.end_time) {
    await finalizeSession(id, req.t);
  } else {
    // Check if both have left
    const updatedLog = await db.findFirst({
      model: "scheduleLog",
      where: { id: log.id },
    });
    if (updatedLog.leaveTime_student && updatedLog.leaveTime_teacher) {
      await finalizeSession(id, req.t);
    }
  }
  return successResponse({ res, req, status: 200, message: "LEFT_SUCCESS" });
});

export const submitReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { rating, comment, teacherAttended, studentAttended } = req.body;
  const user = req.user;

  const session = await db.findOne({
    model: "schedule",
    where: { id },
    include: {
      student: { include: { user: true } },
      teacher: { include: { user: true } },
      scheduleLogs: true,
    },
  });

  if (!session)
    return errorResponse({
      req,
      next,
      status: 404,
      message: "SESSION_NOT_FOUND",
    });

  // Allowed statuses for review/settlement
  const allowedStatuses = ["ongoing", "completed"];
  if (!allowedStatuses.includes(session.status)) {
    return errorResponse({
      req,
      next,
      status: 400,
      message: "SESSION_NOT_READY_FOR_REVIEW",
    });
  }

  const now = new Date();
  const deadline = new Date(session.end_time.getTime() + 48 * 60 * 60 * 1000);
  if (now > deadline)
    return errorResponse({
      req,
      next,
      status: 400,
      message: "REVIEW_WINDOW_EXPIRED",
    });

  const isStudent = user.id === session.student.user.id;
  const isTeacher = user.id === session.teacher.user.id;

  if (!isStudent && !isTeacher)
    return errorResponse({
      req,
      next,
      status: 403,
      message: "NOT_A_PARTICIPANT",
    });

  const revieweeId = isStudent
    ? session.teacher.user.id
    : session.student.user.id;
  const role = isStudent ? "student" : "teacher";

  const existingReview = await db.findFirst({
    model: "Review",
    where: { scheduleId: id, reviewerId: user.id },
  });
  if (existingReview)
    return errorResponse({
      req,
      next,
      status: 400,
      message: "ALREADY_REVIEWED",
    });

  const review = await db.create({
    model: "Review",
    data: {
      scheduleId: id,
      reviewerId: user.id,
      revieweeId,
      rating: parseInt(rating),
      comment,
      role,
    },
  });

  // 🛡️ Logic for settlement (Teacher payout / Student session adjustment)
  // We process settlement based on the flags provided by the reviewer.
  // Note: Only the TEACHER can officially confirm attendance for payment purposes in this current flow.
  if (isTeacher) {
    await db.transaction(async (tx) => {
      await settleTeacherReview({
        tx,
        session,
        scheduleId: id,
        teacherAttended,
        studentAttended,
        translate: req.t,
      });
    });
  }

  await updateAverageRating(revieweeId);

  // Notify reviewee
  await db.create({
    model: "notification",
    data: {
      userId: revieweeId,
      title: req.t("NOTIFICATION_REVIEW_RECEIVED_TITLE"),
      message: req.t("NOTIFICATION_REVIEW_RECEIVED_MSG", { rating }),
      type: "review_received",
    },
  });

  return successResponse({
    res,
    req,
    status: 201,
    message: "REVIEW_SUBMITTED",
    data: review,
  });
});

/* ------------------------------------------------------------------ */
/*                         Helper Functions                           */
/* ------------------------------------------------------------------ */

async function finalizeSession(scheduleId, t) {
  const session = await db.findOne({
    model: "schedule",
    where: { id: scheduleId },
    include: {
      student: true,
      teacher: { include: { user: true } },
    },
  });

  if (!session || session.status === "completed" || session.status === "missed")
    return;

  // ✅ Fetch the log SEPARATELY to avoid stale data from nested include
  const log = await db.findFirst({
    model: "scheduleLog",
    where: { scheduleId },
  });

  if (!log) return;

  // missed = nobody joined at all
  // completed = at least one party joined (student OR teacher)
  let newStatus = "completed";
  if (!log.joinTime_student && !log.joinTime_teacher) {
    newStatus = "missed";
  }

  await db.updateOne({
    model: "schedule",
    where: { id: scheduleId },
    data: { status: newStatus },
  });

  // Notify if missed
  if (newStatus === "missed") {
    await db.create({
      model: "notification",
      data: {
        userId: session.student.user_id,
        title: t ? t("NOTIFICATION_SESSION_MISSED_TITLE") : "Session Missed",
        message: t
          ? t("NOTIFICATION_SESSION_MISSED_MSG", { title: session.title })
          : `The session ${session.title} was marked as missed.`,
        type: "session_missed",
      },
    });
  }
}

async function updateAverageRating(userId) {
  const reviews = await db.findMany({
    model: "Review",
    where: { revieweeId: userId, isHidden: false },
  });

  if (reviews.length === 0) return;

  const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = totalRating / reviews.length;

  // Try updating teacher
  const teacher = await db.findFirst({
    model: "teacher",
    where: { user_id: userId },
  });
  if (teacher) {
    await db.updateOne({
      model: "teacher",
      where: { id: teacher.id },
      data: { avgRating: avg, totalReviews: reviews.length },
    });
  } else {
    // Try updating student
    const student = await db.findFirst({
      model: "student",
      where: { user_id: userId },
    });
    if (student) {
      await db.updateOne({
        model: "student",
        where: { id: student.id },
        data: { avgRating: avg, totalReviews: reviews.length },
      });
    }
  }
}
``;
