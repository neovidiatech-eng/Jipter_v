import * as service from "./ranks.service.js";
import { asyncHandler, successResponse } from "../../../Utils/Response.js";

export const addRank = asyncHandler(async (req, res, next) => {
  const data = await service.addRank(req, res, next);
  if (!data) {
    const error = new Error("Failed to add rank");
    error.status = 500;
    throw error;
  }
  return successResponse({
    res,
    req,
    status: 201,

    message: "Rank Added Successfully",
    data,
  });
});
export const getRanks = asyncHandler(async (req, res, next) => {
  const data = await service.getRanks(req, res, next);
  return successResponse({
    res,
    req,
    status: 200,
    message: "Rank Fetched Successfully",
    data,
  });
});

export const getRank = asyncHandler(async (req, res, next) => {
  const data = await service.getRank(req, res, next);
  return successResponse({
    res,
    req,
    status: 200,
    message: "Rank Fetched Successfully",
    data,
  });
});

export const updateRank = asyncHandler(async (req, res, next) => {
  const data = await service.updateRank(req, res, next);
  return successResponse({
    res,
    req,
    status: 200,
    message: "Rank Updated Successfully",
    data,
  });
});

export const deleteRank = asyncHandler(async (req, res, next) => {
  const data = await service.deleteRank(req, res, next);
  if (!data) {
    const error = new Error("Failed to delete rank");
    error.status = 500;
    throw error;
  }
  return successResponse({
    res,
    req,
    status: 200,
    message: "Rank Deleted Successfully",
    data,
  });
});
