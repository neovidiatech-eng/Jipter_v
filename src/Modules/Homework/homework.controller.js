import {
  asyncHandler,
  errorResponse,
  successResponse,
} from "../../Utils/Response.js";
import * as db from "../../database/dbService.js";
import { PERMISSIONS_V2 } from "../../Constants/permissions.constants.js";

export const createHomework = asyncHandler(async (req, res, next) => {
  const { title, description, dueDate, studentId, status } = req.body;

  const isTeacher = !!req.user.teacher;
  const isManagement = req.user.hasPermission(PERMISSIONS_V2.HOMEWORK.READ);

  const teacher = req.user.teacher;
  const student = await db.findOne({
    model: "student",
    where: {
      id: studentId,
    },
  });

  if (!student) {
    return errorResponse({
      req,
      next,
      message: "STUDENT_NOT_FOUND",
      status: 404,
    });
  }

  // If teacher, assign automatically, if admin we might need teacherId passed.
  const assignedTeacherId = teacher?.id || req.body.teacherId;

  if (!assignedTeacherId) {
    return errorResponse({
      req,
      next,
      message: "MISSING_TEACHER_ID",
      status: 400,
    });
  }

  const homework = await db.create({
    model: "homework",
    data: {
      title,
      description,
      dueDate: new Date(dueDate),
      studentId,
      status: status || "pending",
      teacherId: assignedTeacherId,
    },
  });

  return successResponse({
    res,
    req,
    message: "CREATE_SUCCESS",
    data: homework,
    status: 201,
  });
});

export const updateHomework = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, dueDate, studentId, status } = req.body;

  const homeworkExists = await db.findOne({
    model: "homework",
    where: { id },
  });

  if (!homeworkExists) {
    return errorResponse({
      req,
      next,
      message: "HOMEWORK_NOT_FOUND",
      status: 404,
    });
  }

  const isManagement = req.user.hasPermission(PERMISSIONS_V2.HOMEWORK.READ);
  const isTeacher = !!req.user.teacher;

  // Check permissions: Teacher can update only their own homework.
  if (
    isTeacher &&
    !isManagement &&
    homeworkExists.teacherId !== req.user.teacher?.id
  ) {
    return errorResponse({
      req,
      next,
      message: "UNAUTHORIZED_UPDATE",
      status: 403,
    });
  }

  let finalDueDate = dueDate;
  if (dueDate) {
    finalDueDate = new Date(dueDate);
  }

  const homework = await db.updateOne({
    model: "homework",
    where: { id },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(finalDueDate && { dueDate: finalDueDate }),
      ...(studentId && { studentId }),
      ...(status && { status }),
    },
  });

  return successResponse({
    res,
    req,
    message: "UPDATE_SUCCESS",
    data: homework,
    status: 200,
  });
});

export const deleteHomework = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const homeworkExists = await db.findOne({
    model: "homework",
    where: { id },
  });

  if (!homeworkExists) {
    return errorResponse({
      req,
      next,
      message: "HOMEWORK_NOT_FOUND",
      status: 404,
    });
  }

  const isManagement = req.user.hasPermission(PERMISSIONS_V2.HOMEWORK.READ);
  const isTeacher = !!req.user.teacher;

  // Teacher can only delete their own homework; admin/super_admin can delete any
  if (
    isTeacher &&
    !isManagement &&
    homeworkExists.teacherId !== req.user.teacher?.id
  ) {
    return errorResponse({
      req,
      next,
      message: "UNAUTHORIZED_DELETE",
      status: 403,
    });
  }

  await db.deleteOne({
    model: "homework",
    where: { id },
  });

  return successResponse({
    res,
    req,
    message: "DELETE_SUCCESS",
    status: 200,
  });
});

export const getHomework = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const homework = await db.findOne({
    model: "homework",
    where: { id },
    include: {
      student: { include: { user: true } },
      teacher: { include: { user: true } },
    },
  });

  if (!homework) {
    return errorResponse({
      req,
      next,
      message: "HOMEWORK_NOT_FOUND",
      status: 404,
    });
  }

  return successResponse({
    res,
    req,
    message: "FETCH_SUCCESS",
    data: homework,
    status: 200,
  });
});

export const getStudentHomework = asyncHandler(async (req, res, next) => {
  const student = req.user.student;
  if (!student) {
    return errorResponse({
      req,
      next,
      message: "STUDENT_NOT_FOUND",
      status: 404,
    });
  }

  const homework = await db.findMany({
    model: "homework",
    where: { studentId: student?.id },
    include: {
      student: { include: { user: true } },
      teacher: { include: { user: true } },
    },
  });

  if (!homework) {
    return errorResponse({
      req,
      next,
      message: "HOMEWORK_NOT_FOUND",
      status: 404,
    });
  }

  return successResponse({
    res,
    req,
    message: "FETCH_SUCCESS",
    data: homework,
    status: 200,
  });
});

export const getAllHomework = asyncHandler(async (req, res, next) => {
  const { studentId, teacherId, status, page, limit } = req.query;

  const condition = {};

  if (studentId) condition.studentId = studentId;
  if (teacherId) condition.teacherId = teacherId;
  if (status) condition.status = status;

  const isManagement = req.user.hasPermission(PERMISSIONS_V2.HOMEWORK.READ);

  if (!isManagement) {
    if (req.user.student) {
      condition.studentId = req.user.student.id;
    } else if (req.user.teacher) {
      condition.teacherId = req.user.teacher.id;
    }
  }

  const { items, pagination } = await db.findManyWithPaginationAndCount({
    model: "homework",
    where: condition,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    include: {
      student: { include: { user: { select: { name: true, email: true } } } },
      teacher: { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return successResponse({
    res,
    req,
    message: "FETCH_SUCCESS",
    data: { items, pagination },
    status: 200,
  });
});
export const getTeacherHomeworks = asyncHandler(async (req, res, next) => {
  const teacher = req.user.teacher.id;
  if (!teacher) {
    return errorResponse({
      req,
      next,
      message: "TEACHER_NOT_FOUND",
      status: 404,
    });
  }

  const condition = {};

  if (studentId) condition.studentId = studentId;
  if (teacher) condition.teacherId = teacher;

  const { items, pagination } = await db.findManyWithPaginationAndCount({
    model: "homework",
    where: condition,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    include: {
      student: { include: { user: { select: { name: true, email: true } } } },
      teacher: { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return successResponse({
    res,
    req,
    message: "FETCH_SUCCESS",
    data: { items, pagination },
    status: 200,
  });
});

export const submitHomework = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const student = req.user.student;

  if (!student) {
    return errorResponse({
      req,
      next,
      message: "STUDENT_NOT_FOUND",
      status: 404,
    });
  }

  const homeworkExists = await db.findOne({
    model: "homework",
    where: { id, studentId: student.id , status:"pending"},
  });

  if (!homeworkExists) {
    return errorResponse({
      req,
      next,
      message: "HOMEWORK_NOT_FOUND",
      status: 404,
    });
  }

  // Handle file uploads
  const attachments = [];
  console.log({ file: req.file });

  if (req.file) {
    const file = req.file;
    attachments.push({
      path: file.finalPath,
      name: file.originalname,
      mimetype: file.mimetype,
    });
  }

  if (attachments.length === 0) {
    return errorResponse({
      req,
      next,
      message: "NO_FILES_UPLOADED",
      status: 400,
    });
  }

  const updatedHomework = await db.updateOne({
    model: "homework",
    where: { id },
    data: {
      attachments,
      status: "submitted",
    },
  });

  return successResponse({
    res,
    req,
    message: "SUBMIT_SUCCESS",
    data: updatedHomework,
    status: 200,
  });
});
