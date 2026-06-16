import {
  asyncHandler,
  successResponse,
  errorResponse,
} from "../../Utils/Response.js";
import * as db from "../../database/dbService.js";
import { ensureExists } from "../../database/genericService.js";
import { decryptText, hash, encryptText } from "../../Utils/Security/index.js";
import { DEFAULT_TIMEZONE } from "../../Utils/Date/time.js";
import { findRankByAge, resolveStudentAge } from "../../Utils/Helpers.js";
import { nanoid } from "nanoid";

const getStartingPointLectureIds = async ({
  rankId,
  startingCourseId,
  startingLectureId,
}) => {
  if (!startingCourseId && !startingLectureId) return [];

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
    (course) => course.id === startingCourseId,
  );

  if (selectedCourseIndex === -1) {
    const error = new Error("COURSE_NOT_FOUND");
    error.cause = 404;
    error.isMessageKey = true;
    throw error;
  }

  const selectedCourse = courses[selectedCourseIndex];
  const selectedLecture = selectedCourse.lectures.find(
    (lecture) => lecture.id === startingLectureId,
  );

  if (!selectedLecture) {
    const error = new Error("LECTURE_NOT_FOUND");
    error.cause = 404;
    error.isMessageKey = true;
    throw error;
  }

  return [
    ...courses
      .slice(0, selectedCourseIndex)
      .flatMap((course) => course.lectures.map((lecture) => lecture.id)),
    ...selectedCourse.lectures
      .filter((lecture) => lecture.order < selectedLecture.order)
      .map((lecture) => lecture.id),
  ];
};

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
  const activeStudents = await db.count({
    model: "student",
    where: { active: true },
  });
  const inactiveStudents = await db.count({
    model: "student",
    where: { active: false },
  });
  const totalStudents = await db.count({ model: "student" });

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
    data: {
      studentsData,
      pagination,
      status: { activeStudents, inactiveStudents, totalStudents },
    },
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
    age,
    birth_date,
    gender,
    active,
    rankId,
    startingCourseId,
    startingLectureId,
    timezone,
  } = req.body;

  const studentAge = resolveStudentAge({ age, birthDate: birth_date });

  const [checkUserByEmail, checkPlan, studentRole, settings] =
    await Promise.all([
      email
        ? db.findOne({ model: "user", where: { email } })
        : Promise.resolve(null),
      db.findOne({ model: "plan", where: { id: planId } }),
      db.findFirst({
        model: "role",
        where: { name: { equals: "student", mode: "insensitive" } },
      }),
      db.findFirst({ model: "settings" }),
    ]);

  const rank = await findRankByAge({ age: studentAge });

  if (checkUserByEmail)
    return errorResponse({
      req,
      next,
      message: "EMAIL_EXISTS",
      status: 400,
    });

  if (!checkPlan)
    return errorResponse({ req, next, message: "PLAN_NOT_FOUND", status: 404 });

  if (!rank)
    return errorResponse({
      req,
      next,
      message: "AGE_RANK_NOT_FOUND",
      status: 400,
    });

  const effectiveRankId = rankId || rank.id;
  const completedLectureIds = await getStartingPointLectureIds({
    rankId: effectiveRankId,
    startingCourseId,
    startingLectureId,
  });

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

  // Resolve timezone — use provided, or request-detected/default timezone
  const userTimezone = req.timezone || DEFAULT_TIMEZONE;

  await db.transaction(async (tx) => {
    // 1. Create user
    const prefix = settings?.userPrefix || "jupiter";
    const username = `${name.trim().replace(/\s+/g, "-")}_${nanoid(3)}_${prefix}`;

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
        age: studentAge,
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
        ...(birth_date && { birth_date: new Date(birth_date) }),
        active: active ?? false,
        status: "approved",
        sessions: checkPlan.sessionsCount,
        sessions_attended: 0,
        sessions_remaining: checkPlan.sessionsCount,
        rank: { connect: { id: effectiveRankId } },
      },
    });

    if (completedLectureIds.length) {
      await tx.createMany({
        model: "user_lectures",
        data: completedLectureIds.map((lectureId) => ({
          userId: user.id,
          lectureId,
          status: "completed",
          progress: 100,
          completedAt: new Date(),
        })),
      });
    }

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
      user: {
        include: {
          reviewsReceived: true,
        },
      },
      plan: true,
    },
    message: "STUDENT_NOT_FOUND",
  });

  if (student.user.phone) {
    student.user.phone = await decryptText({ text: student.user.phone });
  }
  delete student.user.password;

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
    username,
    password,
    phone,
    phone_code,
    country,
    planId,
    birth_date,
    age,
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

  if (username && username !== student.user.username) {
    const existing = await db.findOne({ model: "user", where: { username } });
    if (existing)
      return errorResponse({
        req,
        next,
        message: "USERNAME_EXISTS",
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

  const shouldResolveRank = age !== undefined || birth_date;
  const studentAge = shouldResolveRank
    ? resolveStudentAge({ age, birthDate: birth_date })
    : null;
  const autoRank = shouldResolveRank
    ? await findRankByAge({ age: studentAge })
    : null;

  if (shouldResolveRank && !autoRank) {
    return errorResponse({
      req,
      next,
      message: "AGE_RANK_NOT_FOUND",
      status: 400,
    });
  }

  if (!shouldResolveRank && rankId && rankId !== student.rankId) {
    const rank = await db.findOne({ model: "ranks", where: { id: rankId } });
    if (!rank)
      return errorResponse({
        req,
        next,
        message: "RANK_NOT_FOUND",
        status: 404,
      });
  }

  const hashedPassword = password ? await hash({ password }) : undefined;

  // Update user record if needed
  if (
    name ||
    username ||
    password ||
    phone ||
    phone_code ||
    birth_date ||
    age ||
    gender ||
    timezone
  ) {
    const encryptedPhone = phone ? encryptText({ text: phone }) : undefined;
    await db.updateOne({
      model: "user",
      where: { id: student.user_id },
      data: {
        ...(name && { name }),
        ...(username && { username }),
        ...(hashedPassword && { password: hashedPassword }),
        ...(gender && { gender }),
        ...(studentAge !== null ? { age: studentAge } : {}),
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

      ...(active !== undefined && { active }),
      ...(autoRank
        ? { rank: { connect: { id: autoRank.id } } }
        : rankId
          ? { rank: { connect: { id: rankId } } }
          : {}),
    },
    include: { user: true, plan: true },
  });

  updatedStudent.user.phone = await decryptText({
    text: updatedStudent.user.phone,
  });
  delete updatedStudent.user.password;

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
