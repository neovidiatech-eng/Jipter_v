import { asyncHandler, successResponse, errorResponse } from "../../../Utils/Response.js";
import * as coursesService from "./courses.service.js";

export const getAllCourses = asyncHandler(async (req, res, next) => {
    const result = await coursesService.getCourses(req.query);
    return successResponse({ res, req, message: "FETCH_SUCCESS", data: result });
});

export const getCourse = asyncHandler(async (req, res, next) => {
    const course = await coursesService.getCourseById(req.params.id);
    return successResponse({ res, req, message: "FETCH_SUCCESS", data: course });
});

export const createCourse = asyncHandler(async (req, res, next) => {
    const course = await coursesService.createCourse({req,res,next});
    return successResponse({ res, req, message: "CREATE_SUCCESS", data: course, status: 201 });
});

export const updateCourse = asyncHandler(async (req, res, next) => {
    const course = await coursesService.updateCourse({req,res,next});
    return successResponse({ res, req, message: "UPDATE_SUCCESS", data: course });
});



export const deleteCourse = asyncHandler(async (req, res, next) => {
    await coursesService.deleteCourse({req,res,next});
    return successResponse({ res, req, message: "DELETE_SUCCESS" });
});

export const getCourseLecturesForStudent = asyncHandler(async (req, res, next) => {
    const result = await coursesService.getCourseLecturesForStudent({req,res,next});
    return successResponse({ res, req, message: "FETCH_SUCCESS", data: result });
});
