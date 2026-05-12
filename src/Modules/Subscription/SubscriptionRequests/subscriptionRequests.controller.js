import {
  asyncHandler,
  errorResponse,
  successResponse,
} from "../../../Utils/Response.js";
import * as db from "../../../database/dbService.js";
import { redis } from "../../../Utils/Radis/Connection.js";
import { decryptText } from "../../../Utils/Security/index.js";
import { ensureExists } from "../../../database/genericService.js";

export const getSubscriptionRequests = asyncHandler(async (req, res, next) => {
  const { search, status, page = 1, limit = 10 } = req.query;

  let where = {};
  if (search) {
    where = {
      OR: [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { plan: { name: { contains: search, mode: "insensitive" } } },
      ],
    };
  }
  if (status) {
    where.status = status;
  }

  const { items: subscriptionRequests, pagination } =
    await db.findManyWithPaginationAndCount({
      model: "subscription_requests",
      where,
      page,
      limit,
      include: {
        user: true,
        plan: true,
      },
    });

  // Decrypt phone numbers for display
  subscriptionRequests.forEach((s) => {
    if (s.user && s.user.phone && s.user.phone !== "null") {
      s.user.phone = decryptText({ text: s.user.phone });
    }
  });

  return successResponse({
    res,
    req,
    message: "FETCH_SUCCESS",
    status: 200,
    data: { subscriptionRequests, pagination },
  });
});

export const changeStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, rankId } = req.body;

  const subscriptionRequest = await ensureExists({
    model: "subscription_requests",
    where: { id },
    include: {
      user: true,
      plan: true,
    },
    message: "REQUEST_NOT_FOUND",
  });

  if (subscriptionRequest.status !== "pending") {
    return errorResponse({
      next,
      req,
      message: "REQUEST_ALREADY_PROCESSED",
      status: 400,
    });
  }

  // ✅ استخدم userId بدل email (أضمن)
  const redisKey = `${subscriptionRequest.user.email}_Student_data`;

  const studentDataJson = await redis.get(redisKey);
  const parsedStudentData = studentDataJson
    ? JSON.parse(studentDataJson)
    : null;

  if (status === "approved" && !parsedStudentData) {
    return errorResponse({
      next,
      req,
      message: "PENDING_DATA_NOT_FOUND",
      status: 404,
    });
  }

  if (rankId) {
    const rank = await ensureExists({
      model: "ranks",
      where: { id: rankId },
      message: "RANK_NOT_FOUND",
    });
  }
  const studentRole = await db.findFirst({
    model: "role",
    where: { name: { equals: "student", mode: "insensitive" } },
  });

  try {
    await db.transaction(async (tx) => {
      // ✅ system wallet
      const systemWallet = await tx.findFirst({
        model: "wallet",
        where: { type: "system" },
      });

      if (!systemWallet) {
        throw new Error("SYSTEM_WALLET_NOT_FOUND");
      }

      // ✅ update user
      await tx.updateOne({
        model: "user",
        where: { id: subscriptionRequest.user_id },
        data: {
          gender: parsedStudentData.gender,
          status: status === "approved" ? "active" : "rejected",
          ...(status === "approved" &&
            studentRole && { roleId: studentRole.id }),
        },
      });

      // ✅ update request
      await tx.updateOne({
        model: "subscription_requests",
        where: { id },
        data: { status },
      });

      // ❌ لو rejected خلاص
      if (status !== "approved") return;

      // 🔒 prevent duplicate student
      const existingStudent = await tx.findFirst({
        model: "student",
        where: { user_id: subscriptionRequest.user_id },
      });

      if (existingStudent) {
        throw new Error("STUDENT_ALREADY_EXISTS");
      }

      // ✅ create student
      await tx.create({
        model: "student",
        data: {
          user: { connect: { id: subscriptionRequest.user_id } },
          birth_date: new Date(parsedStudentData.birth_date),
          country: parsedStudentData.country,
          plan: { connect: { id: subscriptionRequest.planId } },
          sessions: subscriptionRequest.plan?.sessionsCount || 0,
          sessions_remaining: subscriptionRequest.plan?.sessionsCount || 0,
          status: "approved",
          active: true,
          rank: { connect: { id: rankId } },
        },
      });

      // ✅ create subscription
      const subscription = await tx.create({
        model: "Subscription",
        data: {
          userId: subscriptionRequest.user_id,
          planId: subscriptionRequest.planId,
          status: "active",
          amount: parseFloat(subscriptionRequest.plan?.price) || 0,
          currencyId: subscriptionRequest.plan?.currencyId,
          startDate: new Date(),
          paidAt: new Date(),
        },
      });

      const amount = parseFloat(subscriptionRequest.plan?.price) || 0;

      // ✅ ledger (transaction)
      await tx.create({
        model: "Transaction",
        data: {
          walletId: systemWallet.id,
          type: "credit",
          amount,
          status: "completed",
          reason: "subscription",
          subscriptionId: subscription.id,
        },
      });

      // ✅ update balance
      await tx.updateOne({
        model: "Wallet",
        where: { id: systemWallet.id },
        data: {
          balance: { increment: amount },
        },
      });
    });

    await redis.del(redisKey);

    return successResponse({
      res,
      req,
      message: status === "approved" ? "REQUEST_APPROVED" : "REQUEST_REJECTED",
      status: 200,
    });
  } catch (error) {
    return errorResponse({
      next,
      req,
      message: error.message || "INTERNAL_SERVER_ERROR",
      status: 500,
    });
  }
});
