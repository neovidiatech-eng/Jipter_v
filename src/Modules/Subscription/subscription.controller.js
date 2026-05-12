import * as db from "../../database/dbService.js";
import { asyncHandler, successResponse, errorResponse } from "../../Utils/Response.js";
import { decryptText } from "../../Utils/Security/index.js";

export const getallSubscriptions = asyncHandler(async (req, res, next) => {
  const subscriptions = await db.findMany({
    model: "Subscription",
    include: {
      user: true,
      plan: true,
      currency: true,
    },
  });

  const subscriptionsData = await Promise.all(
    subscriptions.map(async (subscription) => {
      const phone = subscription.user?.phone ? await decryptText({ text: subscription.user.phone }) : "";
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
    orderBy: { createdAt: "desc" }
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

  const phone = subscription.user?.phone ? await decryptText({ text: subscription.user.phone }) : "";
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
