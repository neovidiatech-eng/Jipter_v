import {
  asyncHandler,
  errorResponse,
  successResponse,
} from "../../../Utils/Response.js";
import {
  decryptText,
  encryptText,
  hash,
} from "../../../Utils/Security/index.js";
import * as db from "../../../database/dbService.js";
import { createError } from "../../../Utils/Helpers.js";

export const getProfile = asyncHandler(async (req, res, next) => {
  const user = await db.findOne({
    model: "student",
    where: {
      user_id: req.user.id,
    },

    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          phone: true,
          provider: true,
          googleId: true,
          createdAt: true,
          code_country: true,
          status: true,
          gender: true,
          age: true,
          timezone: true,
        },
      },
      schedules: {
        include: {
          teacher: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  image: true,
                },
              },
            },
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },

      plan: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          duration: true,
          features: true,
          sessionsCount: true,
          rescheduleCount: true,
          currency: {
            select: {
              id: true,
              name_en: true,
              symbol: true,
            },
          },
        },
      },
      rank: true,
    },
  });
  if (!user) {
    const error = createError({
      message: "STUDENT_NOT_FOUND",
      status: 404,
      next,
    });
    throw error;
  }
  const phone = await decryptText({ text: user.user.phone });
  const userDecrypted = {
    ...user,
    user: {
      ...user.user,
      phone: phone,
    },
  };
  return successResponse({
    res,
    req,
    data: userDecrypted,
    status: 200,
    message: "FETCH_SUCCESS",
  });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const {
    name,
    username,
    password,
    phone,
    phone_code,
    age,
    birth_date,
    gender,
    country,
    timezone,
  } = req.body;
  const student = await db.findFirst({
    model: "student",
    where: {
      user_id: user.id,
    },
    include: { user: true },
  });

  if (!student) {
    const error = createError({
      message: "STUDENT_NOT_FOUND",
      status: 404,
      next,
    });
    throw error;
  }

  // Check if username already exists
  if (username && username !== student.user.username) {
    const existingUsername = await db.findOne({
      model: "user",
      where: { username },
    });
    if (existingUsername)
      return errorResponse({
        req,
        message: "USERNAME_EXISTS",
        next,
        status: 400,
      });
  }

  if (phone) {
    const allUsers = await db.findMany({ model: "user" });
    let existingPhone = null;
    for (const existingUser of allUsers) {
      if (existingUser.phone) {
        const decrypted = await decryptText({ text: existingUser.phone });
        if (decrypted === phone && existingUser.id !== user.id) {
          existingPhone = existingUser;
          break;
        }
      }
    }
    if (existingPhone)
      return errorResponse({ req, message: "PHONE_EXISTS", next, status: 400 });
  }

  const hashedPassword = password ? await hash({ password }) : undefined;
  const encryptedPhone = phone ? encryptText({ text: phone }) : undefined;
  const calculatedAge = birth_date
    ? new Date().getFullYear() - new Date(birth_date).getFullYear()
    : undefined;

  let user_updated = student.user;
  if (
    name ||
    username ||
    password ||
    phone ||
    phone_code ||
    age ||
    birth_date ||
    gender ||
    timezone
  ) {
    user_updated = await db.updateOne({
      model: "user",
      where: {
        id: user.id,
      },
      data: {
        ...(name && { name }),
        ...(username && { username }),
        ...(hashedPassword && { password: hashedPassword }),
        ...(phone && { phone: encryptedPhone }),
        ...(phone_code && { code_country: phone_code }),
        ...(age !== undefined
          ? { age: parseInt(age) }
          : calculatedAge !== undefined
            ? { age: calculatedAge }
            : {}),
        ...(gender && { gender }),
        ...(timezone && { timezone }),
      },
    });
  }

  if (country || birth_date) {
    await db.updateOne({
      model: "student",
      where: { id: student.id },
      data: {
        ...(country && { country }),
        ...(birth_date && { birth_date: new Date(birth_date) }),
      },
    });
  }

  if (!user_updated) {
    const error = createError({
      message: "UPDATE_FAILED",
      status: 500,
      next,
    });
    throw error;
  }

  user_updated.phone = await decryptText({ text: user_updated.phone });
  delete user_updated.password;

  return successResponse({
    res,
    req,
    data: user_updated,
    status: 200,
    message: "UPDATE_SUCCESS",
  });
});
