import { Router } from "express";
import { authentication } from "../../Middlewares/Authentication.js";
import { authorization } from "../../Middlewares/Authorization.js";
import * as teacherController from "./teachers.controller.js";
import { validation } from "../../Middlewares/Validation.js";
import {
  createTeacherSchema,
  getAllTeachersSchema,
  getTeacherSchema,
  updateTeacherSchema,
  deleteTeacherSchema,
} from "./teachers.validation.js";
import subjectsRouter from "./subjects/subjects.routes.js";
const router = Router();
router.use("/subjects", subjectsRouter);
router.get(
  "/",
  authentication(),
  /*   authorization({ accessRoles: [] }) ,*/
  validation(getAllTeachersSchema),
  teacherController.getAllTeachers,
);

router.get("/my-students", authentication(),  teacherController.getMyStudents);

router.post(
  "/create",
  /*  authentication(), */
  validation(createTeacherSchema),
  teacherController.createTeacher,
);

router.get(
  "/:id",
  authentication(),
  validation(getTeacherSchema),
  teacherController.getTeacher,
);

router.patch(
  "/update/:id",
  authentication(),
  validation(updateTeacherSchema),
  teacherController.updateTeacher,
);

router.delete(
  "/delete/:id",
  authentication(),
  validation(deleteTeacherSchema),
  teacherController.deleteTeacher,
);

export default router;
