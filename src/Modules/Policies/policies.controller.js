import * as db from "../../database/dbService.js";
import {
  asyncHandler,
  successResponse,
  errorResponse,
} from "../../Utils/Response.js";

// --- Policies ---

// 1. Get All Policies
export const getAllPolicies = asyncHandler(async (req, res, next) => {
  const policies = await db.findMany({
    model: "policy",
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });

  return successResponse({ res, req, data: policies });
});

// 2. Create Policy (Admin)
export const createPolicy = asyncHandler(async (req, res, next) => {
  const policy = await db.create({
    model: "policy",
    data: {
      ...req.body,
      lastUpdated: req.body.lastUpdated ? new Date(req.body.lastUpdated) : new Date(),
    },
  });

  return successResponse({
    res,
    req,
    status: 201,
    data: policy,
    message: "POLICY_CREATED",
  });
});

// 3. Update Policy (Admin)
export const updatePolicy = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const existing = await db.findOne({
    model: "policy",
    where: { id },
  });

  if (!existing) {
    return errorResponse({ req, next, status: 404, message: "POLICY_NOT_FOUND" });
  }

  const updated = await db.updateOne({
    model: "policy",
    where: { id },
    data: {
      ...req.body,
      lastUpdated: req.body.lastUpdated ? new Date(req.body.lastUpdated) : undefined,
    },
  });

  return successResponse({ res, req, data: updated, message: "POLICY_UPDATED" });
});

// 4. Delete Policy (Admin)
export const deletePolicy = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  await db.deleteOne({
    model: "policy",
    where: { id },
  });

  return successResponse({ res, req, message: "POLICY_DELETED" });
});

// --- Policy Notices ---

// 5. Get Active Notice
export const getActiveNotice = asyncHandler(async (req, res, next) => {
  const notice = await db.findFirst({
    model: "policy_notice",
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  return successResponse({ res, req, data: notice });
});

// 6. Create/Update Notice (Admin)
export const upsertNotice = asyncHandler(async (req, res, next) => {
  const { title, content, active } = req.body;
  
  // We'll keep it simple: if there's an active one, update it, else create
  const existing = await db.findFirst({
    model: "policy_notice",
  });

  let notice;
  if (existing) {
    notice = await db.updateOne({
      model: "policy_notice",
      where: { id: existing.id },
      data: { title, content, active },
    });
  } else {
    notice = await db.create({
      model: "policy_notice",
      data: { title, content, active },
    });
  }

  return successResponse({ res, req, data: notice, message: "NOTICE_SAVED" });
});
