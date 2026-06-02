import {
  asyncHandler,
  errorResponse,
  successResponse,
} from "../../../Utils/Response.js";
import * as db from "../../../database/dbService.js";
import { redis } from "../../../Utils/Radis/Connection.js";
import { decryptText } from "../../../Utils/Security/index.js";
import { ensureExists } from "../../../database/genericService.js";
import {
  convertAmount,
  findRankByAge,
  resolveStudentAge,
} from "../../../Utils/Helpers.js";


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
  for (const s of subscriptionRequests) {
    if (s.user && s.user.phone && s.user.phone !== "null") {
      s.user.phone = await decryptText({ text: s.user.phone });
    }
  }

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

  let studentAge = null;
  let selectedRank = null;
  if (status === "approved") {
    studentAge = resolveStudentAge({
      age: parsedStudentData?.age,
      birthDate: parsedStudentData?.birth_date,
    });

    selectedRank = studentAge !== null
      ? await findRankByAge({ age: studentAge })
      : null;

    if (!selectedRank && rankId) {
      selectedRank = await ensureExists({
        model: "ranks",
        where: { id: rankId },
        message: "RANK_NOT_FOUND",
      });
    }

    if (!selectedRank) {
      return errorResponse({
        next,
        req,
        message: studentAge === null
          ? "AGE_OR_BIRTH_DATE_REQUIRED"
          : "AGE_RANK_NOT_FOUND",
        status: 400,
      });
    }
  }

  const studentRole = await db.findFirst({
    model: "role",
    where: { name: { equals: "student", mode: "insensitive" } },
  });

  try {
    await db.transaction(async (tx) => {
      // ✅ system wallet & currencies
      const [systemWallet, defaultCurrency] = await Promise.all([
        tx.findFirst({
          model: "wallet",
          where: { type: "system" },
        }),
        tx.findFirst({
          model: "currency",
          where: { default: true },
        }),
      ]);

      if (!systemWallet || !defaultCurrency) {
        const error = new Error("SYSTEM_CONFIGURATION_ERROR");
        error.isMessageKey = true;
        throw error;
      }

      // ... existing user and request updates ...
      await tx.updateOne({
        model: "user",
        where: { id: subscriptionRequest.user_id },
        data: {
          status: status === "approved" ? "active" : "rejected",
          ...(status === "approved" && studentAge !== null && { age: studentAge }),
          ...(status === "approved" &&
            studentRole && { roleId: studentRole.id }),
        },
      });

      await tx.updateOne({
        model: "subscription_requests",
        where: { id },
        data: { status },
      });

      if (status !== "approved") return;

      // ... existing student creation ...
      const existingStudent = await tx.findFirst({
        model: "student",
        where: { user_id: subscriptionRequest.user_id },
      });

      if (existingStudent) {
        const error = new Error("STUDENT_ALREADY_EXISTS");
        error.isMessageKey = true;
        throw error;
      }

      await tx.create({
        model: "student",
        data: {
          user: { connect: { id: subscriptionRequest.user_id } },
          ...(parsedStudentData.birth_date && {
            birth_date: new Date(parsedStudentData.birth_date),
          }),
          country: parsedStudentData.country,
          plan: { connect: { id: subscriptionRequest.planId } },
          sessions: subscriptionRequest.plan?.sessionsCount || 0,
          sessions_remaining: subscriptionRequest.plan?.sessionsCount || 0,
          status: "approved",
          active: true,
          rank: { connect: { id: selectedRank.id } },
        },
      });

      // ✅ Fetch plan with currency for conversion
      const plan = await tx.findOne({
        model: "plan",
        where: { id: subscriptionRequest.planId },
        include: { currency: true },
      });

      const rawPrice = parseFloat(plan?.price) || 0;
      const convertedAmount = convertAmount(rawPrice, plan.currency.exchangeRate, defaultCurrency.exchangeRate);

      // ✅ create subscription
      const subscription = await tx.create({
        model: "Subscription",
        data: {
          userId: subscriptionRequest.user_id,
          planId: subscriptionRequest.planId,
          status: "active",
          amount: rawPrice,
          currencyId: plan.currencyId,
          startDate: new Date(),
          paidAt: new Date(),
        },
      });

      // ✅ ledger (transaction)
      await tx.create({
        model: "Transaction",
        data: {
          walletId: systemWallet.id,
          type: "subscription",
          amount: convertedAmount,
          status: "completed",
          reason: `Subscription: ${plan.name}`,
          subscriptionId: subscription.id,
        },
      });

      // ✅ update balance
      await tx.updateOne({
        model: "Wallet",
        where: { id: systemWallet.id },
        data: {
          balance: { increment: convertedAmount },
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
