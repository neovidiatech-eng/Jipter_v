import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import { authorizeResource } from "../../Middlewares/AuthorizeResource.js";
import { validation } from "../../Middlewares/Validation.js";
import {
  createStudentSchema,
  updateStudentSchema,
  studentIdSchema,
} from "./students.validation.js";
import * as studentController from "../Students/students.controller.js";

const router = Router();
const studentResource = "users"; // Students are users

router.use(authentication);

router.get("/", authorizeResource(studentResource), studentController.getAllStudents);

router.post(
  "/create",
  authorizeResource(studentResource),
  validation(createStudentSchema),
  studentController.createStudent,
);

router.get(
  "/:id",
  authorizeResource(studentResource),
  validation(studentIdSchema),
  studentController.getStudentById,
);

router.patch(
  "/update/:id",
  authorizeResource(studentResource),
  validation(updateStudentSchema),
  studentController.updateStudent,
);

router.delete(
  "/:id",
  authorizeResource(studentResource),
  validation(studentIdSchema),
  studentController.deleteStudent,
);

export default router;
