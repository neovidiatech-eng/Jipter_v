import {
  asyncHandler,
  successResponse,
  errorResponse,
} from "../../Utils/Response.js";
import * as db from "../../database/dbService.js";
import { ensureExists } from "../../database/genericService.js";
import { decryptText, hash } from "../../Utils/Security/index.js";
import { DEFAULT_TIMEZONE } from "../../Utils/Date/time.js";

export const getAllStudents = asyncHandler(async (req, res, next) => {
  const { search, country, plans, page = 1, limit = 10 } = req.query;

  const where = {};
  if (search) {
    where.user = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };
  }
  if (country) {
    where.country = country;
  }
  if (plans) {
    where.planId = plans;
  }

  const { items: students, pagination } =
    await db.findManyWithPaginationAndCount({
      model: "student",
      where,
      page,
      limit,
      include: {
        user: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
        plan: true,
        rank: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  const studentsData = await Promise.all(
    students.map(async (student) => {
      const phone = await decryptText({ text: student.user.phone });
      return {
        ...student,
        user: {
          ...student.user,
          phone: phone,
        },
      };
    }),
  );

  return successResponse({
    res,
    req,
    message: "FETCH_SUCCESS",
    data: { studentsData, pagination },
    status: 200,
  });
});

export const createStudent = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    password,
    phone,
    phone_code,
    country,
    planId,
    birth_date,
    gender,
    active,
    rankId,
    timezone,
  } = req.body;

  const [
    checkUserByEmail,
    allUsers,
    checkPlan,
    studentRole,
    settings,
    rank,
  ] = await Promise.all([
    email
      ? db.findOne({ model: "user", where: { email } })
      : Promise.resolve(null),
    db.findMany({ model: "user" }),
    db.findOne({ model: "plan", where: { id: planId } }),
    db.findFirst({
      model: "role",
      where: { name: { equals: "student", mode: "insensitive" } },
    }),
    db.findFirst({ model: "settings" }),
    db.findOne({ model: "ranks", where: { id: rankId } }),
  ]);

  let checkUserByPhone = null;
  if (phone) {
    for (const u of allUsers) {
      if (u.phone) {
        const decrypted = await decryptText({ text: u.phone });
        if (decrypted === phone) {
          checkUserByPhone = u;
          break;
        }
      }
    }
  }

  if (checkUserByEmail)
    return errorResponse({
      req,
      next,
      message: "EMAIL_EXISTS",
      status: 400,
    });
  if (checkUserByPhone)
    return errorResponse({
      req,
      next,
      message: "PHONE_EXISTS",
      status: 400,
    });
  
  if (!checkPlan)
    return errorResponse({ req, next, message: "PLAN_NOT_FOUND", status: 404 });

  if (!rank)
    return errorResponse({ req, next, message: "RANK_NOT_FOUND", status: 404 });

  const hashedPassword = await hash({ password });

  // Fetch system wallet before the transaction so we can reference its id inside
  const systemWallet = await db.findFirst({
    model: "wallet",
    where: { type: "system" },
  });

  if (!systemWallet) {
    return errorResponse({
      req,
      next,
      message: "SYSTEM_WALLET_NOT_FOUND",
      status: 500,
    });
  }

  // Resolve timezone — use provided, or fall back to default
  const userTimezone = timezone || DEFAULT_TIMEZONE;

  await db.transaction(async (tx) => {
    // 1. Create user
    const prefix = settings?.userPrefix || "jupiter";
    const username = `${name.trim().replace(/\s+/g, "-")}_${prefix}`;

    const encryptedPhone = phone ? encryptText({ text: phone }) : undefined;
    const user = await tx.create({
      model: "user",
      data: {
        name,
        email: email || undefined,
        username,
        phone: encryptedPhone,
        password: hashedPassword,
        code_country: phone_code,
        status: "active",
        confirmAt: new Date(),
        gender,
        age: birth_date
          ? new Date().getFullYear() - new Date(birth_date).getFullYear()
          : null,
        timezone: userTimezone,
        ...(studentRole && { roleId: studentRole.id }),
      },
    });

    // 2. Create student profile
    await tx.create({
      model: "student",
      data: {
        user: { connect: { id: user.id } },
        country,
        plan: { connect: { id: planId } },
        birth_date: new Date(birth_date),
        active: active ?? false,
        status: "approved",
        sessions: checkPlan.sessionsCount,
        sessions_attended: 0,
        sessions_remaining: checkPlan.sessionsCount,
        rank: { connect: { id: rankId } },
      },
    });

    // 3. Create subscription record
    const subscription = await tx.create({
      model: "Subscription",
      data: {
        userId: user.id,
        planId,
        status: "active",
        amount: parseFloat(checkPlan.price) || 0,
        currencyId: checkPlan.currencyId,
        startDate: new Date(),
        paidAt: new Date(),
      },
    });

    const amount = parseFloat(checkPlan.price) || 0;

    // 4. Create ledger transaction record
    await tx.create({
      model: "Transaction",
      data: {
        walletId: systemWallet.id,
        type: "subscription",
        amount,
        status: "completed",
        reason: "subscription",
        subscriptionId: subscription.id,
      },
    });

    // 5. Increment system wallet balance
    await tx.updateOne({
      model: "Wallet",
      where: { id: systemWallet.id },
      data: { balance: { increment: amount } },
    });
  });

  return successResponse({
    res,
    req,
    message: "CREATE_SUCCESS",
    status: 201,
  });
});

export const getStudentById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const student = await ensureExists({
    model: "student",
    where: { id },
    include: {
      user: true,
      plan: true,
    },
    message: "STUDENT_NOT_FOUND",
  });

  student.user.phone = await decryptText({ text: student.user.phone });

  return successResponse({
    res,
    req,
    message: "FETCH_SUCCESS",
    data: student,
    status: 200,
  });
});

export const updateStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    email,
    phone,
    phone_code,
    country,
    planId,
    birth_date,
    gender,
    active,
    rankId,
    timezone,
  } = req.body;

  const student = await ensureExists({
    model: "student",
    where: { id },
    include: { user: true },
  });

  // Handle unique constraints for user
  if (email && email !== student.user.email) {
    const existing = await db.findOne({ model: "user", where: { email } });
    if (existing)
      return errorResponse({
        req,
        next,
        message: "EMAIL_EXISTS",
        status: 400,
      });
  }

  if (phone) {
    const allUsers = await db.findMany({ model: "user" });
    let existing = null;
    for (const u of allUsers) {
      if (u.phone) {
        const decrypted = await decryptText({ text: u.phone });
        if (decrypted === phone && u.id !== student.user_id) {
          existing = u;
          break;
        }
      }
    }
    if (existing)
      return errorResponse({
        req,
        next,
        message: "PHONE_EXISTS",
        status: 400,
      });
  }

  if (planId && planId !== student.planId) {
    const plan = await db.findOne({ model: "plan", where: { id: planId } });
    if (!plan)
      return errorResponse({
        req,
        next,
        message: "PLAN_NOT_FOUND",
        status: 404,
      });
  }
  if (rankId && rankId !== student.rankId) {
    const rank = await db.findOne({ model: "ranks", where: { id: rankId } });
    if (!rank)
      return errorResponse({
        req,
        next,
        message: "RANK_NOT_FOUND",
        status: 404,
      });
  }

  // Update user record if needed
  if (name || email || phone || phone_code || timezone) {
    const encryptedPhone = phone ? encryptText({ text: phone }) : undefined;
    await db.updateOne({
      model: "user",
      where: { id: student.user_id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone: encryptedPhone }),
        ...(phone_code && { code_country: phone_code }),
        ...(timezone && { timezone }),
      },
    });
  }

  const updatedStudent = await db.updateOne({
    model: "student",
    where: { id },
    data: {
      ...(country && { country }),
      ...(planId && { plan: { connect: { id: planId } } }),
      ...(birth_date && { birth_date: new Date(birth_date) }),
      ...(gender && { gender }),
      ...(active !== undefined && { active }),
      ...(rankId && { rank: { connect: { id: rankId } } }),
    },
    include: { user: true, plan: true },
  });

  updatedStudent.user.phone = await decryptText({ text: updatedStudent.user.phone });

  return successResponse({
    res,
    req,
    message: "UPDATE_SUCCESS",
    data: updatedStudent,
    status: 200,
  });
});

export const deleteStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const student = await ensureExists({ model: "student", where: { id } });

  // Delete user (cascades to student)
  await db.deleteOne({ model: "user", where: { id: student.user_id } });

  return successResponse({
    res,
    req,
    message: "DELETE_SUCCESS",
    status: 200,
  });
});
