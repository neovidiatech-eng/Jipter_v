import { asyncHandler, errorResponse, successResponse } from "../../../Utils/Response.js";
import { decryptText, encryptText } from "../../../Utils/Security/index.js";
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
          name: true,
          phone: true,
          provider: true,
          googleId: true,
          createdAt: true,
          code_country: true,
          status: true,
          gender: true,
          age: true,
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
          subject: {
            select: {
              id: true,
              name: true,
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
    },
  });

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
  const { name, email, age, } = req.body;
  const student = await db.findFirst({
    model: "student",
    where: {
      user_id: user.id,
    },
  });

  if (!student) {
    const error = createError({
      message: "Student not found",
      status: 404,
      next,
    });
    throw error;
  }

  const settings = await db.findFirst({model: "settings"})
  const prefix = settings?.userPrefix || "jupiter";
  const user_name_db = name ? name.toLowerCase().replace(/\s+/g, "-") + "_" + prefix : undefined;  

  // Check if email already exists
  if (email && email !== user.email) {
    const existingEmail = await db.findOne({
      model: "user",
      where: { email },
    });
    if (existingEmail)
      return errorResponse({ req, message: "EMAIL_EXISTS", next, status: 400 });
  }

  // Check if username already exists
  if (user_name_db && user_name_db !== user.username) {
    const existingUsername = await db.findOne({
      model: "user",
      where: { username: user_name_db },
    });
    if (existingUsername)
      return errorResponse({ req, message: "USERNAME_EXISTS", next, status: 400 });
  }
  
  const user_updated = await db.updateOne({
    model: "user",
    where: {
      id: user.id,
    },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(age && { age: parseInt(age) }),
      ...(user_name_db && { username: user_name_db }),
    },
  });

  if (!user_updated) {
    const error = createError({
      message: "User not updated",
      status: 500,
      next,
    });
    throw error;
  }


  return successResponse({
    res,
    req,
    data: user_updated,
    status: 200,
    message: "UPDATED_SUCCESS",
  });
  
});
