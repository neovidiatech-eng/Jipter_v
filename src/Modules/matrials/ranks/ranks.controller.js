import * as service from "./ranks.service.js";
import { asyncHandler, successResponse } from "../../../Utils/Response.js";

export const addRank = asyncHandler(async (req, res, next) => {
  const data = await service.addRank(req, res, next);
  return successResponse({
    res,
    req,
    status: 201,
    message: "CREATE_SUCCESS",
    data,
  });
});

export const getRanks = asyncHandler(async (req, res, next) => {
  const data = await service.getRanks(req, res, next);
  return successResponse({
    res,
    req,
    status: 200,
    message: "FETCH_SUCCESS",
    data,
  });
});

export const getRank = asyncHandler(async (req, res, next) => {
  const data = await service.getRank(req, res, next);
  return successResponse({
    res,
    req,
    status: 200,
    message: "FETCH_SUCCESS",
    data,
  });
});

export const updateRank = asyncHandler(async (req, res, next) => {
  const data = await service.updateRank(req, res, next);
  return successResponse({
    res,
    req,
    status: 200,
    message: "UPDATE_SUCCESS",
    data,
  });
});

export const deleteRank = asyncHandler(async (req, res, next) => {
  await service.deleteRank(req, res, next);
  return successResponse({
    res,
    req,
    status: 200,
    message: "DELETE_SUCCESS",
  });
});
