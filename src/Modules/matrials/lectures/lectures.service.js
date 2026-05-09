import * as db from "../../../database/dbService.js";
import { createError } from "../../../Utils/Helpers.js";

/* -----------------------------
   CREATE LECTURE
----------------------------- */
export const createLecture = async ({ req, res, next }) => {
  const { courseId, title, content, videoUrl, pdfUrl, order, duration, date } = req.body;

  if (!courseId) {
    const error = createError({
      message: "courseId is required",
      status: 400,
      next,
    });

    throw error;
  }

  if (!title) {
    const error = createError({
      message: "title is required",
      status: 400,
      next,
    });
    throw error;
  }

  if (!content) {
    const error = createError({
      message: "content is required",
      status: 400,
      next,
    });
    throw error;
  }

  if (!videoUrl) {
    const error = createError({
      message: "videoUrl is required",
      status: 400,
      next,
    });
    throw error;
  }

  if (!order) {
    const error = createError({
      message: "order is required",
      status: 400,
      next,
    });
    throw error;
  }

  if (!pdfUrl && !videoUrl) {
    const error = createError({
      message: "pdfUrl is required",
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
      message: "Course not found",
      status: 404,
      next,
    });
    throw error;
  }

  const lecture = await db.create({
    model: "lectures",
    data: {
      courseId,
      title,
      content,
      videoUrl,
      order,
      pdfUrl,
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
      message: "Lecture not created",
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
    const error = new Error("Lectures not found");
    error.status = 404;
    throw error;
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
    throw new Error("Lecture not found");
  }

  return lecture;
};

/* -----------------------------
   UPDATE LECTURE
----------------------------- */
export const updateLecture = async ({ req, res, next }) => {
  const { id } = req.params;
  const { courseId, title, content, videoUrl, order, pdfUrl, duration, date } = req.body;
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
    duration,
    date,
  };
  const filteredData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined),
  );

  if (!lecture) {
    const error = createError({
      message: "Lecture not found",
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
        message: "New course not found",
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
      message: "Lecture not found",
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
      message: "Lecture not found",
      status: 404,
      next,
    });
    throw error;
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

