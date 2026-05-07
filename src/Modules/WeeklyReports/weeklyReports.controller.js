import * as db from "../../database/dbService.js";
import {
  asyncHandler,
  successResponse,
  errorResponse,
} from "../../Utils/Response.js";

// 1. Create Report (Teacher)
export const createReport = asyncHandler(async (req, res, next) => {
  const teacherId = req.user.teacher?.id;
  if (!teacherId) {
    return errorResponse({
      req,
      next,
      status: 403,
      message: "ONLY_TEACHERS_CAN_SUBMIT_REPORTS",
    });
  }

  const { weekStarting, weekEnding } = req.body;
  const start = new Date(weekStarting);
  start.setHours(0, 0, 0, 0);
  const end = new Date(weekEnding);
  end.setHours(0, 0, 0, 0);
  // Prevent duplicate reports for the same week start
  const existingReport = await db.findFirst({
    model: "weekly_report",
    where: {
      teacherId,
      weekStarting: start,
    },
  });

  if (existingReport) {
    return errorResponse({
      req,
      next,
      status: 400,
      message: "REPORT_ALREADY_SUBMITTED_FOR_THIS_WEEK",
    });
  }

  const report = await db.create({
    model: "weekly_report",
    data: {
      ...req.body,
      weekStarting: start,
      weekEnding: end,
      teacherId,
    },
  });

  return successResponse({
    res,
    req,
    status: 201,
    data: report,
    message: "WEEKLY_REPORT_CREATED",
  });
});

// 2. Get Weekly Metrics (Teacher)
export const getWeeklyMetrics = asyncHandler(async (req, res, next) => {
  const teacherId = req.user.teacher?.id;
  if (!teacherId) {
    return errorResponse({
      req,
      next,
      status: 403,
      message: "ONLY_TEACHERS_CAN_VIEW_METRICS",
    });
  }

  const { weekStarting, weekEnding } = req.query;

  if (!weekStarting || !weekEnding) {
    return errorResponse({
      req,
      next,
      status: 400,
      message: "WEEK_RANGE_REQUIRED",
    });
  }

  const start = new Date(weekStarting);
  const end = new Date(weekEnding);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  // 1. Total Classes
  const classes = await db.findMany({
    model: "schedule",
    where: {
      teacherId,
      start_time: { gte: start, lte: end },
      status: { not: "cancelled" },
    },
    include: { scheduleLogs: true },
  });

  const totalClasses = classes.length;

  // 2. Students Taught (Distinct)
  const studentIds = new Set(classes.map((c) => c.studentId));
  const studentsTaught = studentIds.size;

  // 3. Avg Session Duration
  let totalDuration = 0;
  let loggedClassesCount = 0;
  classes.forEach((c) => {
    if (c.scheduleLogs?.duration_teacher) {
      totalDuration += c.scheduleLogs.duration_teacher;
      loggedClassesCount++;
    }
  });
  const avgSessionDuration =
    loggedClassesCount > 0 ? totalDuration / loggedClassesCount : 0;

  // 4. Materials Uploaded (Placeholder for now)
  const materialsUploaded = 0;

  return successResponse({
    res,
    req,
    data: {
      totalClasses,
      studentsTaught,
      avgSessionDuration,
      materialsUploaded,
    },
  });
});

// 3. Get My Reports (Teacher)
export const getMyReports = asyncHandler(async (req, res, next) => {
  const teacherId = req.user.teacher?.id;

  if (!teacherId) {
    return errorResponse({
      req,
      next,
      status: 403,
      message: "ONLY_TEACHERS_CAN_VIEW_REPORTS",
    });
  }

  const reports = await db.findMany({
    model: "weekly_report",
    where: { teacherId },
    orderBy: { weekStarting: "desc" },
  });

  return successResponse({ res, req, data: reports });
});

// 4. Get All Reports (Admin)
export const getAllReports = asyncHandler(async (req, res, next) => {
  const reports = await db.findManyWithPaginationAndCount({
    model: "weekly_report",
    include: {
      teacher: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
    page: req.query.page,
    limit: req.query.limit,
  });

  return successResponse({ res, req, data: reports });
});

// 5. Update Report (Teacher)
export const updateReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const teacherId = req.user?.teacher?.id;

  const {
    weekStarting,
    weekEnding,
    totalClasses,
    studentsTaught,
    avgSessionDuration,
    materialsUploaded,
    teachingSummary,
    studentProgress,
    challenges,
    overallRating,
  } = req.body;

  // 1. Get report
  const report = await db.findOne({
    model: "weekly_report",
    where: { id },
  });

  if (!report) {
    return errorResponse({
      req,
      next,
      status: 404,
      message: "REPORT_NOT_FOUND",
    });
  }

  // 2. Authorization check
  if (report.teacherId !== teacherId) {
    return errorResponse({
      req,
      next,
      status: 403,
      message: "UNAUTHORIZED_TO_UPDATE_REPORT",
    });
  }

  // 3. Build update payload dynamically (clean approach)
  const updateData = {};

  const optionalFields = {
    totalClasses,
    studentsTaught,
    avgSessionDuration,
    materialsUploaded,
    teachingSummary,
    studentProgress,
    challenges,
    overallRating,
  };

  Object.entries(optionalFields).forEach(([key, value]) => {
    if (value !== undefined) {
      updateData[key] = value;
    }
  });

  // 4. Handle dates safely
  if (weekStarting) {
    const start = new Date(weekStarting);
    start.setHours(0, 0, 0, 0);
    updateData.weekStarting = start;
  }

  if (weekEnding) {
    const end = new Date(weekEnding);
    end.setHours(23, 59, 59, 999);
    updateData.weekEnding = end;
  }

  // 5. Update
  const updatedReport = await db.updateOne({
    model: "weekly_report",
    where: { id },
    data: updateData,
  });

  return successResponse({
    res,
    req,
    data: updatedReport,
    message: "WEEKLY_REPORT_UPDATED",
  });
});

// 6. Delete Report (Teacher/Admin)
export const deleteReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const teacherId = req.user.teacher?.id;

  const report = await db.findOne({
    model: "weekly_report",
    where: { id },
  });

  if (!report) {
    return errorResponse({
      req,
      next,
      status: 404,
      message: "REPORT_NOT_FOUND",
    });
  }

  if (req.user.role.name !== "admin" && report.teacherId !== teacherId) {
    return errorResponse({
      req,
      next,
      status: 403,
      message: "UNAUTHORIZED_TO_DELETE_REPORT",
    });
  }

  await db.deleteOne({
    model: "weekly_report",
    where: { id },
  });

  return successResponse({ res, req, message: "WEEKLY_REPORT_DELETED" });
});

// 7. Get Single Report
export const getReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const report = await db.findOne({
    model: "weekly_report",
    where: { id },
    include: {
      teacher: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });

  if (!report) {
    return errorResponse({
      req,
      next,
      status: 404,
      message: "REPORT_NOT_FOUND",
    });
  }

  return successResponse({ res, req, data: report });
});
