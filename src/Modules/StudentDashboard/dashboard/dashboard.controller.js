import { asyncHandler, successResponse } from "../../../Utils/Response.js";
import * as dashboardService from "./dashboard.service.js";

export const getDashboard = asyncHandler(async (req, res, next) => {
  const dashboard = await dashboardService.getDashboard({ req, res, next });
  return successResponse({
    res,
    req,
    message: "FETCH_SUCCESS",
    data: dashboard,
    status: 200,
  });
});
