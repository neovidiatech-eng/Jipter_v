import {
  asyncHandler,
  successResponse,
  errorResponse,
} from "../../Utils/Response.js";
import * as db from "../../database/dbService.js";
import { normalizeDate } from "../../Utils/Helpers.js";
import { uploadToCloudinary } from "../../Utils/Cloudinary/upload.js";

// 1. Create Request (Teacher/Student/Admin)
export const createRequest = asyncHandler(async (req, res, next) => {
  const { sessionId, type, reason, requestedData, priority, title } = req.body;
  const requesterId = req.user.id;
  const requesterRole = req.user.role.name;

  // If session-related request, verify session exists
  if (sessionId) {
    const session = await db.findOne({
      model: "schedule",
      where: { id: sessionId },
    });
    if (!session) {
      return errorResponse({
        req,
        next,
        status: 404,
        message: "SESSION_NOT_FOUND",
      });
    }
  }

  // Handle attachments if any
  let attachments = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file, "attachments"),
    );
    attachments = await Promise.all(uploadPromises);
  }

  const request = await db.create({
    model: "request",
    data: {
      sessionId,
      requesterId,
      requesterRole,
      type,
      priority: priority || "medium",
      title: title || type.replace("_", " ").toUpperCase(),
      reason,
      requestedData,
      status: "pending",
      attachments: attachments.length > 0 ? attachments : null,
    },
  });

  // Create Audit Log
  await db.create({
    model: "audit_log",
    data: {
      entityType: "request",
      entityId: request.id,
      action: "create",
      userId: requesterId,
      changes: { type, sessionId, priority },
    },
  });

  return successResponse({
    res,
    req,
    data: request,
    status: 201,
    message: "REQUEST_SUBMITTED",
  });
});

// 2. Get All Requests (Admin)
export const getAllRequests = asyncHandler(async (req, res, next) => {
  const { status, type, priority } = req.query;
  const where = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (priority) where.priority = priority;

  const requests = await db.findMany({
    model: "request",
    where,
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
        },
      },
      schedule: true,
    },
    orderBy: { createdAt: "desc" },
  });
  let student_requests = [];
  let teachers_requests = [];
  for (const request of requests) {
    if (request.requesterRole === "student") {
      student_requests.push(request);
    } else if (request.requesterRole === "teacher") {
      teachers_requests.push(request);
    }
  }

  return successResponse({
    res,
    data: { student_requests, teachers_requests },
  });
});

// 3. Approve Request (Admin)
export const approveRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { adminNotes } = req.body;
  const adminId = req.user.id;

  const request = await db.findOne({
    model: "request",
    where: { id },
    include: { schedule: true },
  });

  if (!request) {
    return errorResponse({
      req,
      next,
      status: 404,
      message: "REQUEST_NOT_FOUND",
    });
  }

  if (request.status !== "pending") {
    return errorResponse({
      req,
      next,
      status: 400,
      message: "REQUEST_ALREADY_PROCESSED",
    });
  }

  const { type, sessionId, requestedData } = request;

  await db.transaction(async (tx) => {
    // 1. Update Request Status
    await tx.updateOne({
      model: "request",
      where: { id },
      data: { status: "approved", adminId, adminNotes },
    });

    // 2. Process based on type (only for automated actions)
    if (type === "reschedule" && sessionId) {
      const oldSession = request.schedule;
      if (!oldSession) throw new Error("RELATED_SESSION_NOT_FOUND");

      const startTime = normalizeDate(requestedData.new_start_time);
      const endTime = normalizeDate(requestedData.new_end_time);

      // Conflict check
      const teacher_conflict = await tx.findFirst({
        model: "schedule",
        where: {
          teacherId: oldSession.teacherId,
          status: { not: "cancelled" },
          start_time: { lt: endTime },
          end_time: { gt: startTime },
        },
      });
      const student_conflict = await tx.findFirst({
        model: "schedule",
        where: {
          studentId: oldSession.studentId,
          status: { not: "cancelled" },
          start_time: { lt: endTime },
          end_time: { gt: startTime },
        },
      });

      if (teacher_conflict || student_conflict) throw new Error("SESSION_CONFLICT");

      await tx.create({
        model: "schedule",
        data: {
          teacherId: oldSession.teacherId,
          studentId: oldSession.studentId,
          subjectId: oldSession.subjectId,
          title: oldSession.title,
          description: oldSession.description,
          link: oldSession.link,
          start_time: startTime,
          end_time: endTime,
          notes: requestedData.suggested_notes || oldSession.notes,
          rescheduledFromId: oldSession.id,
          status: "rescheduled",
        },
      });

      await tx.deleteOne({
        model: "schedule",
        where: { id: oldSession.id },
      });
    } else if (type === "cancel" && sessionId) {
      await tx.updateOne({
        model: "schedule",
        where: { id: sessionId },
        data: { status: "cancelled" },
      });

      const session = await tx.findOne({ model: "schedule", where: { id: sessionId } });
      await tx.updateOne({
        model: "student",
        where: { id: session.studentId },
        data: { sessions_remaining: { increment: 1 } },
      });
    } else if (type === "new_session") {
      const startTime = normalizeDate(requestedData.new_start_time);
      const endTime = normalizeDate(requestedData.new_end_time);
      const teacherId = requestedData.teacherId || request.requesterId;
      const studentId = requestedData.studentId;

      await tx.create({
        model: "schedule",
        data: {
          teacherId,
          studentId,
          subjectId: requestedData.subjectId,
          title: requestedData.title || "New Session",
          description: "Session created via request",
          link: "",
          start_time: startTime,
          end_time: endTime,
          notes: requestedData.suggested_notes,
          status: "scheduled",
        },
      });
    }

    // 3. Create Audit Log
    await tx.create({
      model: "audit_log",
      data: {
        entityType: "request",
        entityId: id,
        action: "approve",
        userId: adminId,
        changes: { from: "pending", to: "approved" },
      },
    });
  });

  return successResponse({
    res,
    req,
    message: "REQUEST_APPROVED",
  });
});

// 4. Reject Request (Admin)
export const rejectRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { adminNotes } = req.body;
  const adminId = req.user.id;

  const request = await db.findOne({ model: "request", where: { id } });
  if (!request) {
    return errorResponse({
      req,
      next,
      status: 404,
      message: "REQUEST_NOT_FOUND",
    });
  }

  if (request.status !== "pending") {
    return errorResponse({
      req,
      next,
      status: 400,
      message: "REQUEST_ALREADY_PROCESSED",
    });
  }

  await db.updateOne({
    model: "request",
    where: { id },
    data: { status: "rejected", adminId, adminNotes },
  });

  return successResponse({
    res,
    req,
    message: "REQUEST_REJECTED",
  });
});

// 5. Get My Requests
export const getMyRequests = asyncHandler(async (req, res, next) => {
  const { status, type } = req.query;
  const userId = req.user.id;

  const where = { requesterId: userId };
  if (status) where.status = status;
  if (type) where.type = type;

  const requests = await db.findMany({
    model: "request",
    where,
    include: {
      schedule: true,
      requester: {
        select: { name: true, email: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return successResponse({ res, data: requests });
});

// 6. Get Requests Dashboard (Admin/User)
export const getRequestsDashboard = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const role = req.user.role.name;
  const isAdmin = role === "admin" || role === "super_admin";

  const where = isAdmin ? {} : { requesterId: userId };

  // 1. Get counts by type
  const typeCounts = await db.groupBy({
    model: "request",
    by: ["type"],
    where,
    _count: { id: true },
  });

  // 2. Get counts by status
  const statusCounts = await db.groupBy({
    model: "request",
    by: ["status"],
    where,
    _count: { id: true },
  });

  // 3. Get recent pending requests
  const pendingRequests = await db.findMany({
    model: "request",
    where: {
      ...where,
      status: "pending",
    },
    include: {
      requester: {
        select: { name: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // 4. Get recent history
  const historyRequests = await db.findMany({
    model: "request",
    where: {
      ...where,
      status: { not: "pending" },
    },
    include: {
      requester: {
        select: { name: true, image: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  // Formatting summary for easier consumption
  const summary = {
    types: typeCounts.reduce((acc, curr) => {
      acc[curr.type] = curr._count.id;
      return acc;
    }, {}),
    statuses: statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {}),
  };

  return successResponse({
    res,
    data: {
      summary,
      pending: pendingRequests,
      history: historyRequests,
    },
  });
});
