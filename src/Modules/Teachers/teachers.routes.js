import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import { authorizeResource } from "../../Middlewares/AuthorizeResource.js";
import { authorize } from "../../Middlewares/Authorize.js";
import * as teacherController from "./teachers.controller.js";
import { validation } from "../../Middlewares/Validation.js";
import {
  createTeacherSchema,
  getAllTeachersSchema,
  getTeacherSchema,
  updateTeacherSchema,
  deleteTeacherSchema,
} from "./teachers.validation.js";
import { PERMISSIONS_V2 } from "../../Constants/permissions.constants.js";

const router = Router();
const teacherResource = "users"; // Teachers are users

router.get(
  "/",
  authentication,
  authorizeResource(teacherResource),
  validation(getAllTeachersSchema),
  teacherController.getAllTeachers,
);

router.get(
  "/my-students",
  authentication,
  authorize(PERMISSIONS_V2.USERS.READ),
  teacherController.getMyStudents,
);

router.post(
  "/create",
  /*  authentication, */ // Public registration?
  validation(createTeacherSchema),
  teacherController.createTeacher,
);

router.get(
  "/:id",
  authentication,
  authorizeResource(teacherResource),
  validation(getTeacherSchema),
  teacherController.getTeacher,
);

router.patch(
  "/update/:id",
  authentication,
  authorizeResource(teacherResource),
  validation(updateTeacherSchema),
  teacherController.updateTeacher,
);

router.delete(
  "/delete/:id",
  authentication,
  authorizeResource(teacherResource),
  validation(deleteTeacherSchema),
  teacherController.deleteTeacher,
);

export default router;
