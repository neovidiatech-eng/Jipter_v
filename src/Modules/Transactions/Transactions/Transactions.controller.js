import {
  asyncHandler,
  errorResponse,
  successResponse,
} from "../../../Utils/Response.js";
import * as db from "../../../database/dbService.js";

export const getTransactions = asyncHandler(async (req, res, next) => {
  const transaction = await db.findMany({
    model: "transaction",
    include: {
      wallet: true,
      subscription: true,
    },
  });

  return successResponse({
    res,
    req,
    message: "FETCH_SUCCESS",
    status: 200,
    data: transaction,
  });
});
