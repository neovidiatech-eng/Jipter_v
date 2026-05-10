import { asyncHandler, successResponse } from "../../Utils/Response.js";
import * as service from "./support.service.js";

// --- Support Controllers ---
export const getSupport = asyncHandler(async (req, res, next) => {
  const data = await service.getSupport({ req, res, next });
  return successResponse({ res, req, data, message: "FETCH_SUCCESS", status: 200 });
});

export const getSupportById = asyncHandler(async (req, res, next) => {
  const data = await service.getSupportById({ req, res, next });
  return successResponse({ res, req, data, message: "FETCH_SUCCESS", status: 200 });
});

export const createSupport = asyncHandler(async (req, res, next) => {
  const data = await service.createSupport({ req, res, next });
  return successResponse({ res, req, data, message: "CREATE_SUCCESS", status: 201 });
});

export const updateSupport = asyncHandler(async (req, res, next) => {
  const data = await service.updateSupport({ req, res, next });
  return successResponse({ res, req, data, message: "UPDATE_SUCCESS", status: 200 });
});

export const deleteSupport = asyncHandler(async (req, res, next) => {
  const data = await service.deleteSupport({ req, res, next });
  return successResponse({ res, req, data, message: "DELETE_SUCCESS", status: 200 });
});

// --- Category Controllers ---
export const getCategories = asyncHandler(async (req, res, next) => {
  const data = await service.getCategories({ req, res, next });
  return successResponse({ res, req, data, message: "FETCH_SUCCESS", status: 200 });
});

export const createCategory = asyncHandler(async (req, res, next) => {
  const data = await service.createCategory({ req, res, next });
  return successResponse({ res, req, data, message: "CREATE_SUCCESS", status: 201 });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const data = await service.updateCategory({ req, res, next });
  return successResponse({ res, req, data, message: "UPDATE_SUCCESS", status: 200 });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const data = await service.deleteCategory({ req, res, next });
  return successResponse({ res, req, data, message: "DELETE_SUCCESS", status: 200 });
});
export const getTeacherSupport = asyncHandler(async (req, res, next) => {
  const data = await service.getTeacherSupport({ req, res, next });
  return successResponse({ res, req, data, message: "FETCH_SUCCESS", status: 200 });
});
