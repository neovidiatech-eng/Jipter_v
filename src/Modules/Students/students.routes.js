import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import { authorization } from "../../Middlewares/Authorization.js"; 
import { endpoints } from "./student.authorization.js";
import { validation } from "../../Middlewares/Validation.js";
import {
  createStudentSchema,
  updateStudentSchema,
  studentIdSchema,
} from "./students.validation.js";
import * as studentController from "../Students/students.controller.js"
const router = Router();

router.get("/", authentication, studentController.getAllStudents);

router.post(
  "/create",
  authentication,
  authorization({ permissions: endpoints.createStudent }),
  validation(createStudentSchema),
  studentController.createStudent,
);

router.get(
  "/:id",
  authentication,
  authorization({ permissions: endpoints.getStudent }),
  validation(studentIdSchema),
  studentController.getStudentById,
);

router.patch(
  "/update/:id",
  authentication,
  authorization({ permissions: endpoints.updateStudent }),
  validation(updateStudentSchema),
  studentController.updateStudent,
);

router.delete(
  "/:id",
  authentication,
  authorization({ permissions: endpoints.deleteStudent }),
  validation(studentIdSchema),
  studentController.deleteStudent,
);

export default router;
