import * as db from "../../database/dbService.js";
import {
  asyncHandler,
  successResponse,
  errorResponse,
} from "../../Utils/Response.js";
import { decryptText } from "../../Utils/Security/index.js";
import { ensureExists } from "../../database/genericService.js";
import { convertAmount } from "../../Utils/Helpers.js";

const getPreviousCourseLectureIds = async ({ rankId, courseId }) => {
  const courses = await db.findMany({
    model: "courses",
    where: { rankId },
    orderBy: { createdAt: "asc" },
    include: {
      lectures: {
        orderBy: { order: "asc" },
      },
    },
  });

  const selectedCourseIndex = courses.findIndex(
    (course) => course.id === courseId,
  );

  if (selectedCourseIndex === -1) {
    const error = new Error("COURSE_NOT_FOUND");
    error.cause = 404;
    error.isMessageKey = true;
    throw error;
  }

  return courses
    .slice(0, selectedCourseIndex)
    .flatMap((course) => course.lectures.map((lecture) => lecture.id));
};

export const getallSubscriptions = asyncHandler(async (req, res, next) => {
  const subscriptions = await db.findMany({
    model: "Subscription",
    include: {
      user: {
        include:{
          student:true
        }
      },
      plan: true,
      currency: true,
      
    },
  });

  const subscriptionsData = await Promise.all(
    subscriptions.map(async (subscription) => {
      const phone = subscription.user?.phone
        ? await decryptText({ text: subscription.user.phone })
        : "";
      return {
        id: subscription.id,
        status: subscription.status,
        amount: subscription.amount,
        currencyId: subscription.currencyId,
        startDate: subscription.startDate,
        paidAt: subscription.paidAt,
        user: {
          name: subscription.user?.name,
          email: subscription.user?.email,
          code_country: subscription.user?.code_country,
          status: subscription.user?.status,
          phone: phone,
        },
        student: subscription.user.student,
        plan: {
          id: subscription.plan?.id,
          name: subscription.plan?.name,
          description: subscription.plan?.description,
          price: subscription.plan?.price,
          duration: subscription.plan?.duration,
          features: [
            "Access to all courses",
            "Priority support",
            "Certificate of completion",
          ],
          currencyId: subscription.plan?.currencyId,
          createdAt: subscription.plan?.createdAt,
          updatedAt: subscription.plan?.updatedAt,
          active: subscription.plan?.active,
          sessionsCount: subscription.plan?.sessionsCount,
        },
        currency: {
          id: subscription.currency?.id,
          name: subscription.currency?.name_en,
          symbol: subscription.currency?.symbol,
          code: subscription.currency?.code,
          default: subscription.currency?.default,
          exchangeRate: subscription.currency?.exchangeRate,
        },
      };
    }),
  );

  return successResponse({
    res,
    req,
    status: 200,
    message: "FETCH_SUCCESS",
    data: subscriptionsData,
  });
});

export const getMySubscription = asyncHandler(async (req, res, next) => {
  const subscription = await db.findFirst({
    model: "Subscription",
    include: {
      user: true,
      plan: true,
      currency: true,
    },
    where: {
      userId: req.user.id, // Usually linked to user.id
    },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription) {
    return successResponse({
      res,
      req,
      status: 200,
      data: null,
      message: "FETCH_SUCCESS",
    });
  }

  const phone = subscription.user?.phone
    ? await decryptText({ text: subscription.user.phone })
    : "";
  const subscriptionData = {
    id: subscription.id,
    status: subscription.status,
    amount: subscription.amount,
    currencyId: subscription.currencyId,
    startDate: subscription.startDate,
    paidAt: subscription.paidAt,
    user: {
      name: subscription.user?.name,
      email: subscription.user?.email,
      code_country: subscription.user?.code_country,
      status: subscription.user?.status,
      phone: phone,
    },
    plan: {
      id: subscription.plan?.id,
      name: subscription.plan?.name,
      description: subscription.plan?.description,
      price: subscription.plan?.price,
      duration: subscription.plan?.duration,
      features: [
        "Access to all courses",
        "Priority support",
        "Certificate of completion",
      ],
      currencyId: subscription.plan?.currencyId,
      createdAt: subscription.plan?.createdAt,
      updatedAt: subscription.plan?.updatedAt,
      active: subscription.plan?.active,
      sessionsCount: subscription.plan?.sessionsCount,
    },
    currency: {
      id: subscription.currency?.id,
      name: subscription.currency?.name_en,
      symbol: subscription.currency?.symbol,
      code: subscription.currency?.code,
      default: subscription.currency?.default,
      exchangeRate: subscription.currency?.exchangeRate,
    },
  };

  return successResponse({
    res,
    req,
    status: 200,
    message: "FETCH_SUCCESS",
    data: subscriptionData,
  });
});
export const renewSubscription = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const { planId, rankId, courseId } = req.body;

  const [student, plan, rank, course, systemWallet, defaultCurrency] =
    await Promise.all([
      ensureExists({
        model: "student",
        where: { id: studentId },
        include: { user: true },
        message: "STUDENT_NOT_FOUND",
      }),
      ensureExists({
        model: "plan",
        where: { id: planId },
        include: { currency: true },
        message: "PLAN_NOT_FOUND",
      }),
      ensureExists({
        model: "ranks",
        where: { id: rankId },
        message: "RANK_NOT_FOUND",
      }),
      ensureExists({
        model: "courses",
        where: { id: courseId },
        include: { lectures: { orderBy: { order: "asc" } } },
        message: "COURSE_NOT_FOUND",
      }),
      db.findFirst({
        model: "wallet",
        where: { type: "system" },
      }),
      db.findFirst({
        model: "currency",
        where: { default: true },
      }),
    ]);

  if (course.rankId !== rank.id) {
    return errorResponse({
      req,
      next,
      message: "COURSE_NOT_FOUND",
      status: 404,
    });
  }

  if (!systemWallet || !defaultCurrency) {
    return errorResponse({
      req,
      next,
      message: "SYSTEM_CONFIGURATION_ERROR",
      status: 500,
    });
  }

  const rawAmount = parseFloat(plan.price) || 0;
  const convertedAmount = convertAmount(
    rawAmount,
    plan.currency.exchangeRate,
    defaultCurrency.exchangeRate,
  );
  const completedLectureIds = await getPreviousCourseLectureIds({
    rankId: rank.id,
    courseId,
  });

  let renewedSubscription;
  if (student.sessions && student.sessions_remaining > 0) {
    return errorResponse({
      req,
      next,
      message: "STUDENT_HAS_ACTIVE_SUBSCRIPTION",
      status: 400,
    });
  }

  await db.transaction(async (tx) => {
    await tx.updateOne({
      model: "student",
      where: { id: student.id },
      data: {
        active: true,
        status: "approved",
        plan: { connect: { id: plan.id } },
        rank: { connect: { id: rank.id } },
        sessions: plan.sessionsCount,
        sessions_remaining: plan.sessionsCount,
      },
    });

    await tx.deleteMany({
      model: "user_lectures",
      where: {
        userId: student.user_id,
        lecture: {
          course: {
            rankId: rank.id,
          },
        },
      },
    });

    if (completedLectureIds.length) {
      await tx.createMany({
        model: "user_lectures",
        data: completedLectureIds.map((lectureId) => ({
          userId: student.user_id,
          lectureId,
          status: "completed",
          progress: 100,
          completedAt: new Date(),
        })),
      });
    }

    renewedSubscription = await tx.create({
      model: "Subscription",
      data: {
        userId: student.user_id,
        planId: plan.id,
        status: "active",
        amount: rawAmount,

        currencyId: plan.currencyId,
        startDate: new Date(),
        paidAt: new Date(),
      },
      include: {
        plan: true,
        currency: true,
      },
    });

    await tx.create({
      model: "Transaction",
      data: {
        walletId: systemWallet.id,
        type: "subscription",
        amount: convertedAmount,
        status: "completed",
        reason: `Subscription renewal: ${plan.name} for ${student.user?.name}`,
        subscriptionId: renewedSubscription.id,
      },
    });

    await tx.updateOne({
      model: "wallet",
      where: { id: systemWallet.id },
      data: {
        balance: { increment: convertedAmount },
      },
    });
  });

  return successResponse({
    res,
    req,
    status: 200,
    message: "UPDATE_SUCCESS",
    data: renewedSubscription,
  });
});
