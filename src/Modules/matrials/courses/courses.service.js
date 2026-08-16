import * as db from "../../../database/dbService.js";
import { createError, getRecordLockStatus, isFreeTrialStudent } from "../../../Utils/Helpers.js";

/* -----------------------------
   Shared Includes
----------------------------- */
const lecturesInclude = {
  rank: {
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
      ageRange: true,
    },
  },
  lectures: {
    orderBy: { order: "asc" },
  },
};

/* -----------------------------
   CREATE COURSE
----------------------------- */
export const createCourse = async ({ req, res, next }) => {
  const { rankId, title, description } = req.body;

  if (!rankId) {
    const error = createError({
      message: "RANK_ID_REQUIRED",
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

  // check rank exists
  const rank = await db.findFirst({
    model: "ranks",
    where: { id: rankId },
  });

  if (!rank) {
    const error = createError({
      message: "RANK_NOT_FOUND",
      status: 404,
      next,
    });
    throw error;
  }

  // check title exists
  const courseTitle = await db.findFirst({
    model: "courses",
    where: { title },
  });

  if (courseTitle) {
    const error = createError({
      message: "TITLE_EXISTS",
      status: 409,
      next,
    });
    throw error;
  }
  let image = "";
  if (req.file) {
    image = req?.file?.finalPath || "";
  }

  const course = await db.create({
    model: "courses",
    data: { rankId, title, description, image },
  });

  return course;
};

/* -----------------------------
   GET ALL COURSES
----------------------------- */
export const getCourses = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const rankId = query.rankId;
  const title = query.title;
  const { sortBy = "createdAt" } = query;
  const sortDirection = query.sort || "desc";
  

  const where = {};

  if (rankId) {
    where.rankId = rankId;
  }

  if(title){
    where.title = { contains: title, mode: "insensitive" };
  } 
  return await db.findManyWithPaginationAndCount({
    model: "courses",
    where,
    page,
    limit,
    orderBy: [
      { [sortBy]: sortDirection },
    ],
    include: lecturesInclude,
  });
};

/* -----------------------------
   GET COURSE BY ID
----------------------------- */
export const getCourseById = async (id) => {
  const course = await db.findFirst({
    model: "courses",
    where: { id },
    include: lecturesInclude,
  });

  if (!course) {
    const error = new Error("COURSE_NOT_FOUND");
    error.isMessageKey = true;
    throw error;
  }

  return course;
};

/* -----------------------------
   UPDATE COURSE
----------------------------- */
export const updateCourse = async ({ req, res, next }) => {
  const { title, description, rankId } = req.body;
  const { id } = req.params;

  // validate title if exists
  if (title) {
    const courseTitle = await db.findFirst({
      model: "courses",
      where: { title, id: { not: id } },
    });

    if (courseTitle) {
      const error = createError({
        message: "TITLE_EXISTS",
        status: 409,
        next,
      });
      throw error;
    }
  }

  const course = await db.findFirst({
    model: "courses",
    where: { id },
  });

  if (!course) {
    const error = createError({
      message: "COURSE_NOT_FOUND",
      status: 404,
      next,
    });
    throw error;
  }

  // validate rank change if exists
  if (rankId && rankId !== course.rankId) {
    const rank = await db.findFirst({
      model: "ranks",
      where: { id: rankId },
    });

    if (!rank) {
      const error = createError({
        message: "RANK_NOT_FOUND",
        status: 404,
        next,
      });
      throw error;
    }
  }

  return await db.updateOne({
    model: "courses",
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(rankId !== undefined && { rankId }),
    },
  });
};



/* -----------------------------
   DELETE COURSE
----------------------------- */
export const deleteCourse = async ({ req, res, next }) => {
  const { id } = req.params;
  const course = await db.findFirst({
    model: "courses",
    where: { id },
  });

  if (!course) {
    const error = createError({
      message: "COURSE_NOT_FOUND",
      status: 404,
      next,
    });
    throw error;
  }

  return await db.deleteOne({
    model: "courses",
    where: { id },
  });
};

/* -----------------------------
   GET COURSE LECTURES FOR STUDENT
----------------------------- */
export const getCourseLecturesForStudent = async ({ req, res, next }) => {
  const { id } = req.params; // courseId
  const userId = req.user.id;

  // 1. Get course and lectures
  const course = await db.findFirst({
    model: "courses",
    where: { id },
    include: {
      lectures: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) {
    const error = createError({
      message: "COURSE_NOT_FOUND",
      status: 404,
      next,
    });
    throw error;
  }

  // 2. Get user's progress for these lectures
  const userLectures = await db.findMany({
    model: "user_lectures",
    where: {
      userId,
      lectureId: { in: course.lectures.map((l) => l.id) },
    },
  });

  // Check if student has a free trial / 1 session plan
  const student = await db.findFirst({
    model: "student",
    where: { user_id: userId },
    include: { plan: true },
  });

  let isFreeTrial = false;
  let bookedSchedule = null;
  let studentSchedules = [];

  if (student) {
    studentSchedules = await db.findMany({
      model: "schedule",
      where: {
        studentId: student.id,
        courseId: id,
      },
      orderBy: { start_time: "asc" },
    });

    isFreeTrial = isFreeTrialStudent(student);

    if (isFreeTrial) {
      bookedSchedule = studentSchedules[0] || null;
    }
  }

  // 3. Map lectures to include status, locked, availableAt
  let foundFirstNonCompleted = false;
  const lecturesWithStatus = course.lectures.map((lecture, index) => {
    const userLecture = userLectures.find((ul) => ul.lectureId === lecture.id);
    const linkedSchedule =
      studentSchedules.find((s) => s.lecturesId === lecture.id) ||
      studentSchedules.find((s) => s.courseId === course.id) ||
      bookedSchedule;

    const { locked, availableAt } = getRecordLockStatus(linkedSchedule);

    let status = locked ? "Locked" : "Pending";

    if (locked) {
      status = "Locked";
    } else if (isFreeTrial) {
      const isLinkedLecture =
        bookedSchedule &&
        (bookedSchedule.lecturesId === lecture.id ||
          (!bookedSchedule.lecturesId && index === 0));
      if (isLinkedLecture) {
        if (userLecture && userLecture.status === "completed") {
          status = "Completed";
        } else {
          status = "Pending";
        }
      } else {
        status = "Locked";
      }
    } else {
      if (userLecture && userLecture.status === "completed") {
        status = "Completed";
      } else if (!foundFirstNonCompleted) {
        status = "Pending";
        foundFirstNonCompleted = true;
      }
    }

    const isRecordLocked = locked || status === "Locked";

    return {
      ...lecture,
      locked: isRecordLocked,
      availableAt: availableAt || lecture.date || null,
      status,
      ...(isRecordLocked && {
        videoUrl: null,
        pdfUrl: null,
        slidesUrl: null,
        content: null,
      }),
    };
  });

  return {
    ...course,
    lectures: lecturesWithStatus,
  };
};
