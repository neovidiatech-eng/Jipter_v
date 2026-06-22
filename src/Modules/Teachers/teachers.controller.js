import {
  asyncHandler,
  errorResponse,
  successResponse,
} from "../../Utils/Response.js";
import * as db from "../../database/dbService.js";
import { ensureExists } from "../../database/genericService.js";
import { decryptText, encryptText, hash } from "../../Utils/Security/index.js";
import { nanoid } from "nanoid";

export const getAllTeachers = asyncHandler(async (req, res, next) => {
  const { search, page = 1, limit = 10, active } = req.query;

  let where = {};
  if (search) {
    where.user = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  if (active !== undefined) {
    where.active = active === "true";
  }

  const { items: teachers, pagination } =
    await db.findManyWithPaginationAndCount({
      model: "teacher",
      where,
      page,
      limit,
      include: {
        user: true,
      },
    });

  for (const teacher of teachers) {
    if (teacher.user && teacher.user.phone) {
      teacher.user.phone = await decryptText({ text: teacher.user.phone });
    }
    if (teacher.user && teacher.user.password) {
      teacher.user.password = await decryptText({ text: teacher.user.password });
    }
  }

  const activeCount = await db.count({
    model: "teacher",
    where: { active: true },
  });

  return successResponse({
    res,
    req,
    message: "FETCH_SUCCESS",
    data: {
      teachers,
      pagination,
      activeCount,
      inactiveCount: pagination.totalItems - activeCount,
    },
  });
});

export const createTeacher = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    password,
    phone,
    code_country,
    currency_id,
    gender,
    age,
    hour_price,
    active,
  } = req.body;

  const [checkUserByEmail, checkCurrency, getrole, settings] =
    await Promise.all([
      db.findOne({ model: "user", where: { email } }),
      db.findOne({ model: "currency", where: { id: currency_id } }),
      db.findFirst({ model: "role", where: { name: "teacher" } }),
      db.findFirst({ model: "settings" }),
    ]);

  if (!getrole)
    return errorResponse({ req, message: "ROLE_NOT_FOUND", next, status: 404 });

  if (checkUserByEmail)
    return errorResponse({ req, message: "EMAIL_EXISTS", next, status: 400 });

  if (!checkCurrency)
    return errorResponse({
      req,
      message: "CURRENCY_NOT_FOUND",
      next,
      status: 404,
    });

  const hashedPassword = encryptText({ text: password });

  // 🔥 كل حاجة في transaction واحدة
  const prefix = settings?.userPrefix || "jupiter";
  const username = `${name.trim().replace(/\s+/g, "-")}${nanoid(5)}_${prefix}`;

  const result = await db.transaction(async (tx) => {
    const user = await tx.create({
      model: "user",
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        phone: phone ? encryptText({ text: phone }) : undefined,
        code_country,
        roleId: getrole.id,
        confirmAt: new Date(),
        status: "active",
        gender,
        age: parseInt(age),
      },
    });

    const teacher = await tx.create({
      model: "teacher",
      data: {
        user: { connect: { id: user.id } },
        currency: { connect: { id: checkCurrency.id } },
        hour_price,
        active: active ?? false,
      },
      include: { user: true },
    });

    const wallet = await tx.create({
      model: "wallet",
      data: {
        type: "teacher",
        ownerId: user.id,
        balance: 0,
        currencyId: checkCurrency.id,
        userId: user.id,
      },
    });

    return { teacher, wallet };
  });

  if (result.teacher?.user) {
    if (result.teacher.user.phone) {
      result.teacher.user.phone = await decryptText({ text: result.teacher.user.phone });
    }
    if (result.teacher.user.password) {
      result.teacher.user.password = await decryptText({ text: result.teacher.user.password });
    }
  }

  return successResponse({
    res,
    req,
    message: "CREATE_SUCCESS",
    data: result,
    status: 201,
  });
});
export const getTeacher = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const teacher = await ensureExists({
    model: "teacher",
    where: { id },
    select: {
      id: true,
      hour_price: true,
      active: true,
      createdAt: true,
      updatedAt: true,
  
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          code_country: true,
          status: true,
          gender: true,
          age: true,
          createdAt: true,
          password: true,
              wallet:true,
        },

      },
      currency: {
        select: {
          id: true,
          name_en: true,
          symbol: true,
          code: true,
          createdAt: true,
        },
      },
    },
    message: "TEACHER_NOT_FOUND",
    next,
    status: 404,
  });

  if (teacher?.currency) {
    teacher.currency.name = teacher.currency.name_en;
    delete teacher.currency.name_en;
  }

  if (teacher.user && teacher.user.phone) {
    teacher.user.phone = await decryptText({ text: teacher.user.phone });
  }
  if (teacher.user && teacher.user.password) {
    teacher.user.password = await decryptText({ text: teacher.user.password });
  }
  const [sessionCount, uniqueStudentGroups,totalsessions] = await Promise.all([
    db.count({
      model: "schedule",
      where: { status: "completed", teacherId: teacher.id },
    }),
    db.groupBy({
      model: "schedule",
      by: ["studentId"],
      where: { teacherId: teacher.id },
    }),
    db.count({
      model: "schedule",
      where: { teacherId: teacher.id },
    }),
  ]);

  const teacherStudents = uniqueStudentGroups.length;
  const result = { ...teacher, sessionCount, teacherStudents,totalsessions };



  return successResponse({
    res,
    req,
    message: "FETCH_SUCCESS",
    data: result,
  });
});

export const updateTeacher = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    email,
    password,
    phone,
    code_country,
    currency_id,
    gender,
    age,
    hour_price,
    active,
  } = req.body;

  const teacher = await ensureExists({
    model: "teacher",
    where: { id },
    include: { user: true },
  });

  if (password && req.user.role.name !== "admin" && req.user.role.name !== "super_admin") {
    return errorResponse({
      req,
      next,
      message: "ONLY_ADMIN_OR_SUPER_ADMIN_CAN_CHANGE_PASSWORDS",
      status: 403,
    });
  }

  let hashedPassword;
  if (password) {
    hashedPassword = encryptText({ text: password });
  }

  // Handle unique constraints
  if (email && email !== teacher.user.email) {
    const existing = await db.findOne({ model: "user", where: { email } });
    if (existing)
      return errorResponse({
        req,
        message: "EMAIL_EXISTS",
        next,
        status: 400,
      });
  }

  // Update user data first if needed
  if (name || email || hashedPassword || phone || code_country || gender || age) {
    await db.updateOne({
      model: "user",
      where: { id: teacher.user_id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(hashedPassword && { password: hashedPassword }),
        ...(phone && { phone: encryptText({ text: phone }) }),
        ...(code_country && { code_country }),
        ...(gender && { gender }),
        ...(age && { age: parseInt(age) }),
      },
    });
  }

  // Update teacher data
  const updatedTeacher = await db.updateOne({
    model: "teacher",
    where: { id },
    data: {
      ...(currency_id && { currency: { connect: { id: currency_id } } }),
      ...(hour_price !== undefined && { hour_price }),
      ...(active !== undefined && { active }),
    },
    include: {
      user: true,
      currency: true,
    },
  });

  if (updatedTeacher.user && updatedTeacher.user.phone) {
    updatedTeacher.user.phone = await decryptText({
      text: updatedTeacher.user.phone,
    });
  }
  if (updatedTeacher.user && updatedTeacher.user.password) {
    updatedTeacher.user.password = await decryptText({
      text: updatedTeacher.user.password,
    });
  }

  return successResponse({
    res,
    req,
    message: "UPDATE_SUCCESS",
    data: updatedTeacher,
  });
});

export const deleteTeacher = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const teacher = await ensureExists({ model: "teacher", where: { id } });

  // Delete related records and user
  // Since we added onDelete: Cascade in schema, deleting the user will delete the teacher record too.
  await db.deleteOne({
    model: "user",
    where: { id: teacher.user_id },
  });

  return successResponse({
    res,
    req,
    message: "DELETE_SUCCESS",
  });
});

export const getMyStudents = asyncHandler(async (req, res, next) => {
  const teacher = req.user.teacher;

  const myStudents = await db.findMany({
    model: "schedule",
    where: {
      teacherId: teacher?.id,
    },
    include: {
      student: {
        include: {
          user: true,
        },
      },
      teacher: {
        include: {
          user: true,
        },
      },
    },
  });

  const students = Object.values(
    myStudents.reduce(async (acc, item) => {
      const student = item.student;

      if (!acc[student.id]) {
        acc[student.id] = {
          id: student.id,
          user_id: student.user.id,
          name: student.user.name,
          code: `STU-${student.id.slice(0, 3)}`,
          email: student.user.email,
          phone: `${student.user.code_country}${await decryptText({ text: student.user.phone })}`,
          sessions: `${student.sessions_attended}/${student.sessions}`,
        };
      }

      return acc;
    }, {}),
  );
  return successResponse({
    res,
    req,
    message: "FETCH_SUCCESS",
    data: students,
  });
});
