import {
  asyncHandler,
  errorResponse,
  successResponse,
} from "../../Utils/Response.js";
import * as db from "../../database/dbService.js";

import { PERMISSIONS } from "../../Utils/Permissions/permissions.js";

export const createExam = asyncHandler(async (req, res, next) => {
  const { title, totalMarks, studentId, status, dueDate, duration } =
    req.body;
  
  const isTeacher = req.user.hasPermission(PERMISSIONS.TEACHER_PROFILE_READ); // Or another appropriate teacher-only permission
  const isManagement = req.user.hasPermission(PERMISSIONS.EXAM_ALL_READ);
  
  const teacher = req.user.teacher;
  const student = await db.findOne({
    model: "student",
    where: {
      id: studentId,
    },
  });

  if (!student) {
     return errorResponse({ req, next, message: "STUDENT_NOT_FOUND", status: 404 });
  }

  if (!isTeacher && !isManagement) {
    return errorResponse({ req, next, message: "ONLY_TEACHERS_ADMINS_CREATE", status: 403 });
  }

  // If teacher, assign automatically, if admin we might need teacherId passed.
  const assignedTeacherId = teacher?.id || req.body.teacherId;

  if (!assignedTeacherId) {
    return errorResponse({ req, next, message: "MISSING_TEACHER_ID", status: 400 });
  }

  const exam = await db.create({
    model: "exam",
    data: {
      title,
      totalMarks,
      studentId,
      status: status || "pending",
      teacherId: assignedTeacherId,
      dueDate,
      duration,
    },
  });
  if (!exam) {
    return errorResponse({
      req,
      next,
      message: "CREATE_FAILED",
      status: 500,
    });
  }

  return successResponse({ res, req, message: "CREATE_SUCCESS", data: exam, status: 201 });
});

export const updateExam = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, totalMarks, dueDate, studentId, status, duration } =
    req.body;

  const examExists = await db.findOne({
    model: "exam",
    where: { id },
  });

  if (!examExists) {
    return errorResponse({ req, next, message: "EXAM_NOT_FOUND", status: 404 });
  }

  const isManagement = req.user.hasPermission(PERMISSIONS.EXAM_ALL_READ);
  const isTeacher = req.user.hasPermission(PERMISSIONS.TEACHER_PROFILE_READ);

  if (
    isTeacher && 
    !isManagement &&
    examExists.teacherId !== req.user.teacher?.id
  ) {
    return errorResponse({ req, next, message: "UNAUTHORIZED_UPDATE", status: 403 });
  }

  const exam = await db.updateOne({
    model: "exam",
    where: { id },
    data: {
      ...(title && { title }),
      ...(totalMarks !== undefined && { totalMarks }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
      ...(studentId && { studentId }),
      ...(status && { status }),
      ...(duration !== undefined && { duration }),
    },
  });

  return successResponse({ res, req, message: "UPDATE_SUCCESS", data: exam, status: 200 });
});

export const deleteExam = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const examExists = await db.findOne({
    model: "exam",
    where: { id },
  });

  if (!examExists) {
    return errorResponse({ req, next, message: "EXAM_NOT_FOUND", status: 404 });
  }

  const isManagement = req.user.hasPermission(PERMISSIONS.EXAM_ALL_READ);
  const isTeacher = req.user.hasPermission(PERMISSIONS.TEACHER_PROFILE_READ);

  // Teacher can only delete their own exams
  if (
    isTeacher &&
    !isManagement &&
    examExists.teacherId !== req.user.teacher?.id
  ) {
    return errorResponse({ req, next, message: "UNAUTHORIZED_DELETE", status: 403 });
  }

  await db.deleteOne({
    model: "exam",
    where: { id },
  });

  return successResponse({
    res,
    req,
    message: "DELETE_SUCCESS",
    status: 200,
  });
});

export const getExam = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const exam = await db.findOne({
    model: "exam",
    where: { id },
    include: {
      student: { include: { user: true } },
      teacher: { include: { user: true } },
    },
  });

  if (!exam) {
    return errorResponse({ req, next, message: "EXAM_NOT_FOUND", status: 404 });
  }

  return successResponse({ res, req, message: "FETCH_SUCCESS", data: exam, status: 200 });
});
export const getStudentExams = asyncHandler(async (req, res, next) => {
  const user = req.user.student || req.user.teacher;
  if (!user) {
    return errorResponse({ req, next, message: "STUDENT_OR_TEACHER_NOT_FOUND", status: 404 });
  }

  
  const where = {};
  const isStudent = req.user.hasPermission(PERMISSIONS.STUDENT_PROFILE_READ);
  const isTeacher = req.user.hasPermission(PERMISSIONS.TEACHER_PROFILE_READ);

  if (isStudent) {
    where.studentId = req.user.student?.id;
  } else if (isTeacher) {
    where.teacherId = req.user.teacher?.id;
  }

  const exams = await db.findMany({
    model: "exam",
    where,
    include: {
      student: { include: { user: true } },
      teacher: { include: { user: true } },
    },
  });

  if (!exams) {
    return errorResponse({ req, next, message: "EXAM_NOT_FOUND", status: 404 });
  }

  return successResponse({ res, req, message: "FETCH_SUCCESS", data: exams, status: 200 });
});

export const getAllExams = asyncHandler(async (req, res, next) => {
  const { studentId, teacherId, status, page, limit } = req.query;

  const condition = {};

  if (studentId) condition.studentId = studentId;
  if (teacherId) condition.teacherId = teacherId;
  if (status) condition.status = status;

  const isStudent = req.user.hasPermission(PERMISSIONS.STUDENT_PROFILE_READ);
  const isTeacher = req.user.hasPermission(PERMISSIONS.TEACHER_PROFILE_READ);
  const isManagement = req.user.hasPermission(PERMISSIONS.EXAM_ALL_READ);

  // Role based filtering
  if (isStudent && !isManagement) {
    condition.studentId = req.user.student?.id;
  } else if (isTeacher && !isManagement && !teacherId) {
    condition.teacherId = req.user.teacher?.id;
  }

  const { items, pagination } = await db.findManyWithPaginationAndCount({
    model: "exam",
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
