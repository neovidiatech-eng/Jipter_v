import { asyncHandler, successResponse } from "../../../Utils/Response.js";
import { decryptText } from "../../../Utils/Security/index.js";
import * as db from "../../../database/dbService.js";

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
