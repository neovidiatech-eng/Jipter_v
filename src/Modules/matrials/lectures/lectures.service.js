import * as db from "../../../database/dbService.js";
import { createError } from "../../../Utils/Helpers.js";

/* -----------------------------
   CREATE LECTURE
----------------------------- */
export const createLecture = async ({ req, res, next }) => {
  const { courseId, title, content, videoUrl, pdfUrl, slidesUrl, duration, date } = req.body;
  let { order } = req.body;

  if (!courseId) {
    const error = createError({
      message: "COURSE_ID_REQUIRED",
      status: 400,
      next,
    });

    throw error;
  }

  if (!title) {
    const error = createError({
      message: "TITLE_REQUIRED",
      status: 400,
      next,
    });
    throw error;
  }

  if (!content) {
    const error = createError({
      message: "DESCRIPTION_REQUIRED",
      status: 400,
      next,
    });
    throw error;
  }

  if (!videoUrl) {
    const error = createError({
      message: "LINK_REQUIRED",
      status: 400,
      next,
    });
    throw error;
  }

  if (!pdfUrl && !videoUrl && !slidesUrl) {
    const error = createError({
      message: "LINK_REQUIRED",
      status: 400,
      next,
    });
    throw error;
  }

  // check course exists
  const course = await db.findFirst({
    model: "courses",
    where: { id: courseId },
  });

  if (!course) {
    const error = createError({
      message: "COURSE_NOT_FOUND",
      status: 404,
      next,
    });
    throw error;
  }

  // Auto-calculate order if not provided
  if (order === undefined || order === null) {
    const lastLecture = await db.findFirst({
      model: "lectures",
      where: { courseId },
      orderBy: { order: "desc" },
    });
    order = lastLecture ? lastLecture.order + 1 : 1;
  }

  const lecture = await db.create({
    model: "lectures",
    data: {
      courseId,
      title,
      content,
      videoUrl,
      order: parseInt(order),
      pdfUrl,
      slidesUrl,
      duration,
      date,
    },
    include: {
      course: {
        select: {
          title: true,
        },
      },
    },
  });
  if (!lecture) {
    const error = createError({
      message: "CREATE_FAILED",
      status: 500,
      next,
    });
    throw error;
  }
  return lecture;
};

/* -----------------------------
   GET ALL LECTURES
----------------------------- */
export const getLectures = async ({ req, res, next }) => {
  const { page, limit, courseId } = req.query;

  const where = {};

  if (courseId) {
    where.courseId = courseId;
  }
  const lectures = await db.findManyWithPaginationAndCount({
    model: "lectures",
    where,
    page,
    limit,
    orderBy: { order: "asc" },
  });
  if (!lectures) {
    throw createError({ message: "LECTURE_NOT_FOUND", status: 404, next });
  }

  return lectures;
};

/* -----------------------------
   GET LECTURE BY ID
----------------------------- */
export const getLectureById = async (id) => {
  const lecture = await db.findFirst({
    model: "lectures",
    where: { id },
  });

  if (!lecture) {
    const error = new Error("LECTURE_NOT_FOUND");
    error.isMessageKey = true;
    throw error;
  }

  return lecture;
};

/* -----------------------------
   UPDATE LECTURE
----------------------------- */
export const updateLecture = async ({ req, res, next }) => {
  const { id } = req.params;
  const { courseId, title, content, videoUrl, order, pdfUrl, slidesUrl, duration, date } = req.body;
  const lecture = await db.findFirst({
    model: "lectures",
    where: { id },
  });
  const data = {
    courseId,
    title,
    content,
    videoUrl,
    order,
    pdfUrl,
    slidesUrl,
    duration,
    date,
  };
  const filteredData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined),
  );

  if (!lecture) {
    const error = createError({
      message: "LECTURE_NOT_FOUND",
      status: 404,
      next,
    });
    throw error;
  }

  // validate course change if exists
  if (courseId && courseId !== lecture.courseId) {
    const course = await db.findFirst({
      model: "courses",
      where: { id: courseId },
    });

    if (!course) {
      const error = createError({
        message: "COURSE_NOT_FOUND",
        status: 404,
        next,
      });
      throw error;
    }
  }

  return await db.updateOne({
    model: "lectures",
    where: { id },
    data: filteredData,
  });
};

/* -----------------------------
   DELETE LECTURE
----------------------------- */
export const deleteLecture = async ({ req, res, next }) => {
  const { id } = req.params;

  const lecture = await db.findFirst({
    model: "lectures",
    where: { id },
  });

  if (!lecture) {
    const error = createError({
      message: "LECTURE_NOT_FOUND",
      status: 404,
      next,
    });
    throw error;
  }

  return await db.deleteOne({
    model: "lectures",
    where: { id },
  });
};

/* -----------------------------
   COMPLETE LECTURE
----------------------------- */
export const completeLecture = async ({ req, res, next }) => {
  const { id } = req.params; // lectureId
  const userId = req.user.id;

  // 1. Check if lecture exists
  const lecture = await db.findFirst({
    model: "lectures",
    where: { id },
  });

  if (!lecture) {
    const error = createError({
      message: "LECTURE_NOT_FOUND",
      status: 404,
      next,
    });
    throw error;
  }

  // Check student session completion status & free trial restrictions
  const student = await db.findFirst({
    model: "student",
    where: { user_id: userId },
    include: { plan: true },
  });

  if (student) {
    const isFreeTrial = student.sessions === 1 || 
                        student.plan?.price === "0" || 
                        student.plan?.name?.toLowerCase().includes("free") ||
                        student.plan?.name?.toLowerCase().includes("trial") ||
                        student.plan?.sessionsCount === 1;

    if (isFreeTrial) {
      // Free trial logic: Must have a booked schedule in this course and it must be completed
      const bookedSchedule = await db.findFirst({
        model: "schedule",
        where: {
          studentId: student.id,
          courseId: lecture.courseId,
        },
      });

      if (!bookedSchedule || bookedSchedule.status !== "completed") {
        const error = createError({
          message: "LECTURE_LOCKED",
          status: 403,
          next,
        });
        throw error;
      }

      // Allow completing ONLY the lecture linked to the booked schedule
      const linkedLectureId = bookedSchedule.lecturesId || bookedSchedule.lectureId;
      if (linkedLectureId && linkedLectureId !== id) {
        const error = createError({
          message: "LECTURE_LOCKED",
          status: 403,
          next,
        });
        throw error;
      }
    } else {
      // General student requirement: must have completed the session linked to this lecture/course
      const bookedSchedule = await db.findFirst({
        model: "schedule",
        where: {
          studentId: student.id,
          OR: [
            { lecturesId: id },
            { lecturesId: null },
          ],
        },
      });

console.log(bookedSchedule);


      if (!bookedSchedule || bookedSchedule.status !== "completed") {
        const error = createError({
          message: "LECTURE_LOCKED",
          status: 403,
          next,
        });
        throw error;
      }
    }
  }

  // 2. Upsert user_lectures
  const userLecture = await db.upsertOne({
    model: "user_lectures",
    where: {
      userId_lectureId: {
        userId,
        lectureId: id,
      },
    },
    update: {
      status: "completed",
      completedAt: new Date(),
    },
    create: {
      userId,
      lectureId: id,
      status: "completed",
      completedAt: new Date(),
    },
  });

  return userLecture;
};

