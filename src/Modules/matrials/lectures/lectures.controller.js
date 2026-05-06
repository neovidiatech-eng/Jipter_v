import {
  asyncHandler,
  successResponse,
  errorResponse,
} from "../../../Utils/Response.js";
import * as lecturesService from "./lectures.service.js";

export const getAllLectures = asyncHandler(async (req, res, next) => {
  const result = await lecturesService.getLectures({ req, res, next });

  return successResponse({ res, req, message: "FETCH_SUCCESS", data: result });
});

export const getLecture = asyncHandler(async (req, res, next) => {
  const lecture = await lecturesService.getLectureById({ req, res, next });
  return successResponse({ res, req, message: "FETCH_SUCCESS", data: lecture });
});

export const createLecture = asyncHandler(async (req, res, next) => {
  const lecture = await lecturesService.createLecture({ req, res, next });
  return successResponse({
    res,
    req,
    message: "CREATE_SUCCESS",
    data: lecture,
    status: 201,
  });
});

export const updateLecture = asyncHandler(async (req, res, next) => {
  const lecture = await lecturesService.updateLecture({ req, res, next });
  return successResponse({
    res,
    req,
    message: "UPDATE_SUCCESS",
    data: lecture,
  });
});

export const deleteLecture = asyncHandler(async (req, res, next) => {
  await lecturesService.deleteLecture({ req, res, next });
  return successResponse({ res, req, message: "DELETE_SUCCESS" });
});
