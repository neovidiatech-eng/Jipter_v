import {
  asyncHandler,
  errorResponse,
  successResponse,
} from "../../../Utils/Response.js";
import * as db from "../../../database/dbService.js";

// ========================= GET ALL =========================
export const getAllPlans = asyncHandler(async (req, res, next) => {
  const plans = await db.findMany({
    model: "plan",
    orderBy: { createdAt: "desc" },
    include: {
      currency: {
        select: {
          id: true,
          name_en: true,
          name_ar: true,
          symbol: true,
          code: true,
        },
      },
    },
  });

  return successResponse({
    res,
    req,
    message: "FETCH_SUCCESS",
    status: 200,
    data: plans,
  });
});

// ========================= CREATE =========================
export const createPlan = asyncHandler(async (req, res, next) => {
  const {
    name,
    price,
    duration,
    sessionsCount,
    rescheduleCount,
    description,
    active,
    features,
    currencyId,
    type,
  } = req.body;

  // 🔥 parallel queries
  const [existPlan, existCurrency] = await Promise.all([
    db.findFirst({ model: "plan", where: { name } }),
    db.findFirst({ model: "currency", where: { id: currencyId } }),
  ]);

  if (existPlan) {
    return errorResponse({
      req,
      next,
      message: "PLAN_ALREADY_EXISTS",
      status: 400,
    });
  }

  if (!existCurrency) {
    return errorResponse({
      req,
      next,
      message: "CURRENCY_NOT_FOUND",
      status: 404,
    });
  }

  const plan = await db.create({
    model: "plan",
    data: {
      name,
      type,
      description,
      price: String(price),
      // ⚠️ لو غيرت الموديل لـ Float شيل String()
      duration,
      sessionsCount: sessionsCount ?? 0,
      rescheduleCount: rescheduleCount ?? 0,
      active: active ?? false,
      features,
      currency: {
        connect: { id: currencyId },
      },
    },
  });

  return successResponse({
    res,
    req,
    message: "CREATE_SUCCESS",
    status: 201,
    data: plan,
  });
});

// ========================= UPDATE =========================
export const updatePlan = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const {
    name,
    price,
    duration,
    sessionsCount,
    rescheduleCount,
    description,
    active,
    features,
    currencyId,
  } = req.body;

  const plan = await db.findOne({
    model: "plan",
    where: { id },
  });

  if (!plan) {
    return errorResponse({
      req,
      next,
      message: "PLAN_NOT_FOUND",
      status: 404,
    });
  }

  // 🔥 check unique name
  if (name && name !== plan.name) {
    const existPlan = await db.findFirst({
      model: "plan",
      where: { name },
    });

    if (existPlan) {
      return errorResponse({
        req,
        next,
        message: "PLAN_ALREADY_EXISTS",
        status: 400,
      });
    }
  }

  // 🔥 check currency
  if (currencyId) {
    const existCurrency = await db.findFirst({
      model: "currency",
      where: { id: currencyId },
    });

    if (!existCurrency) {
      return errorResponse({
        req,
        next,
        message: "CURRENCY_NOT_FOUND",
        status: 404,
      });
    }
  }

  // 🔥 dynamic update object
  const data = {};

  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (price !== undefined) data.price = String(price);
  if (duration !== undefined) data.duration = duration;
  if (sessionsCount !== undefined) data.sessionsCount = sessionsCount;
  if (rescheduleCount !== undefined) data.rescheduleCount = rescheduleCount;
  if (active !== undefined) data.active = active;
  if (features !== undefined) data.features = features;

  if (currencyId !== undefined) {
    data.currency = {
      connect: { id: currencyId },
    };
  }

  const updatedPlan = await db.updateOne({
    model: "plan",
    where: { id },
    data,
  });

  return successResponse({
    res,
    req,
    message: "UPDATE_SUCCESS",
    status: 200,
    data: updatedPlan,
  });
});

// ========================= DELETE =========================
export const deletePlan = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const plan = await db.findOne({
    model: "plan",
    where: { id },
  });

  if (!plan) {
    return errorResponse({
      req,
      next,
      message: "PLAN_NOT_FOUND",
      status: 404,
    });
  }

  await db.deleteOne({
    model: "plan",
    where: { id },
  });

  return successResponse({
    res,
    req,
    message: "DELETE_SUCCESS",
    status: 200,
  });
});
