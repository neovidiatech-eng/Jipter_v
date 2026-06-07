import { getNowUTC } from "../../Utils/Date/time.js";
import {
  asyncHandler,
  errorResponse,
  successResponse,
} from "../../Utils/Response.js";
import * as db from "../../database/dbService.js";

export const getAllRoles = asyncHandler(async (req, res, next) => {
  const { search } = req.query;
  let where = {};
  if (search) {
    where.name = {
      contains: search,
    };
  }
  const roles = await db.findMany({
    model: "role",
    where,
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  const rolePermissions = roles.map((role) => ({
    id: role.id,
    name: role.name,
    permissions: role.rolePermissions.map(
      (rolePermission) => rolePermission.permission,
    ),
  }));
  return successResponse({
    res,
    req,
    status: 200,
    message: "FETCH_SUCCESS",
    data: rolePermissions,
  });
});
export const createRole = asyncHandler(async (req, res, next) => {
  const { name, permissionIds } = req.body;
  if (!name) {
    return errorResponse({
      req,
      next,
      message: "MISSING_NAME",
      status: 400,
    });
  }
  const existsRole = await db.findOne({
    model: "role",
    where: {
      name,
    },
  });
  if (existsRole) {
    return errorResponse({
      req,
      next,
      message: "ROLE_EXISTS",
      status: 400,
    });
  }
  if (permissionIds?.length > 0) {
    const permissions = await db.findMany({
      model: "permission",
      where: {
        id: {
          in: permissionIds,
        },
      },
    });
    if (permissions.length !== permissionIds.length) {
      return errorResponse({
        req,
        next,
        message: "PERMISSION_NOT_FOUND",
        status: 404,
      });
    }
  }
  const newRole = await db.transaction(async (tx) => {
    const role = await tx.create({
      model: "role",
      data: {
        name,
      },
      include: {
        rolePermissions: true,
      },
    });
    if (permissionIds?.length > 0) {
      const rolePermissions = await tx.createMany({
        model: "rolePermission",
        data: permissionIds.map((id) => ({
          roleId: role.id,
          permissionId: id,
        })),
      });
    }
    return role;
  });
  return successResponse({
    res,
    req,
    status: 200,
    message: "CREATE_SUCCESS",
    data: newRole,
  });
});

export const assignRoleToUser = asyncHandler(async (req, res, next) => {
  const { user_id } = req.params;
  const { role_id } = req.body;

  if (!role_id) {
    return errorResponse({
      req,
      next,
      message: "MISSING_ROLE_ID",
      status: 400,
    });
  }
  const existsRole = await db.findOne({
    model: "role",
    where: {
      id: role_id,
    },
  });
  if (!existsRole) {
    return errorResponse({
      req,
      next,
      message: "ROLE_NOT_FOUND",
      status: 400,
    });
  }
  const newRole = await db.updateOne({
    model: "user",
    where: {
      id: user_id,
    },
    data: {
      roleId: role_id,
    },
    include: {
      role: true,
    },
  });
  return successResponse({
    res,
    req,
    status: 200,
    message: "ROLE_ASSIGNED_SUCCESS",
    data: {
      newRole,
    },
  });
});

export const updateRole = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return errorResponse({ req, next, message: "MISSING_NAME", status: 400 });
  }

  const role = await db.findOne({
    model: "role",
    where: { id },
  });

  if (!role) {
    return errorResponse({
      req,
      next,
      message: "ROLE_NOT_FOUND",
      status: 404,
    });
  }

  if (name) {
    const existsRole = await db.findOne({
      model: "role",
      where: { name },
    });

    if (existsRole && existsRole.id !== id) {
      return errorResponse({
        req,
        next,
        message: "ROLE_EXISTS",
        status: 400,
      });
    }
  }

  const updatedRole = await db.updateOne({
    model: "role",
    where: { id },
    data: { name },
  });

  return successResponse({
    res,
    req,
    status: 200,
    message: "UPDATE_SUCCESS",
    data: updatedRole,
  });
});

export const deleteRole = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const role = await db.findOne({
    model: "role",
    where: { id },
  });

  if (!role) {
    return errorResponse({
      req,
      next,
      message: "ROLE_NOT_FOUND",
      status: 404,
    });
  }

  await db.deleteOne({
    model: "role",
    where: { id },
  });

  return successResponse({
    res,
    req,
    status: 200,
    message: "DELETE_SUCCESS",
  });
});
export const getDashboard = asyncHandler(async (req, res, next) => {
  const now = getNowUTC();
  const startOfDay = now.startOf("day").toDate();
  const endOfDay = now.endOf("day").toDate();
  const sevenDaysAgo = now.subtract(7, "day").startOf("day").toDate();

  const [
    studentsCount,
    teachersCount,
    pendingRequestsCount,
    todaySessionsCount,
    upcomingSessions,
    lastSevenDaysSessions,
    recentRequests,
    recentReviews,
    newTeachers,
  ] = await Promise.all([
    db.count({ model: "student" }),
    db.count({ model: "teacher" }),
    db.count({ model: "request", where: { status: "pending" } }),
    db.count({
      model: "schedule",
      where: { start_time: { gte: startOfDay, lte: endOfDay } },
    }),
    
    // Upcoming Sessions
    db.findMany({
      model: "schedule",
      where: { 
        start_time: { gte: now.toDate(), lte: endOfDay },
        status: "scheduled"
      },
      take: 5,
      orderBy: { start_time: "asc" },
      include: { course: true, teacher: { include: { user: true } }, student: { include: { user: true } } }
    }),

    // Sessions for last 7 days
    db.findMany({
      model: "schedule",
      where: { start_time: { gte: sevenDaysAgo } },
      select: { start_time: true }
    }),

    // Activity Feed Sources
    db.findMany({
      model: "request",
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { requester: true }
    }),
    db.findMany({
      model: "Review",
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { reviewer: true, reviewee: true }
    }),
    db.findMany({
      model: "teacher",
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true }
    }),
  ]);

  // Process Sessions per Day
  const sessionsPerDay = [];
  for (let i = 6; i >= 0; i--) {
    const date = now.subtract(i, "day").format("YYYY-MM-DD");
    const count = lastSevenDaysSessions.filter(s => 
      getNowUTC(s.start_time).format("YYYY-MM-DD") === date
    ).length;
    sessionsPerDay.push({ date, count });
  }

  // Combine Activity Feed
  const activityFeed = [
    ...recentRequests.map(r => ({
      id: r.id,
      type: "request",
      title: `${r.requester.name} requested a ${r.type}`,
      time: r.createdAt,
      user: r.requester.name,
      avatar: r.requester.image?.secure_url
    })),
    ...recentReviews.map(rv => ({
      id: rv.id,
      type: "review",
      title: `Session completed with ${rv.reviewee.name}: "${rv.comment || ""}"`,
      time: rv.createdAt,
      user: rv.reviewer.name,
      avatar: rv.reviewer.image?.secure_url
    })),
    ...newTeachers.map(t => ({
      id: t.id,
      type: "onboarding",
      title: `New Instructor Onboarded: ${t.user.name}`,
      time: t.createdAt,
      user: t.user.name,
      avatar: t.user.image?.secure_url
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

  return successResponse({
    res,
    req,
    data: {
      stats: {
        totalStudents: studentsCount,
        totalTeachers: teachersCount,
        pendingRequests: pendingRequestsCount,
        todaySessions: todaySessionsCount,
      },
      sessionsPerDay,
      upcomingSessions: upcomingSessions.map(s => ({
        id: s.id,
        title: s.title,
        course: s.course.title,
        time: s.start_time,
        teacher: s.teacher.user.name,
        student: s.student.user.name
      })),
      activityFeed,
      activeUsers: {
        students: studentsCount, // Simplified for now
        instructors: teachersCount
      }
    },
    status: 200,
    message: "FETCH_SUCCESS",
  });
});

