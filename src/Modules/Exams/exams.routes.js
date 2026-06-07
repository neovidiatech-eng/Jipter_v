import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import { validation } from "../../Middlewares/Validation.js";
import { authorizeResource } from "../../Middlewares/AuthorizeResource.js";
import { authorize } from "../../Middlewares/Authorize.js";
import * as examsController from "./exams.controller.js";
import * as schema from "./exams.validation.js";
import { PERMISSIONS_V2 } from "../../Constants/permissions.constants.js";

const router = Router();
const examsResource = "exams";

router.post(
  "/",
  authentication,
  authorizeResource(examsResource),
  validation(schema.createExam),
  examsController.createExam,
);

router.delete(
  "/:id",
  authentication,
  authorizeResource(examsResource),
  validation(schema.deleteExam),
  examsController.deleteExam,
);

router.get(
  "/exam/:id",
  authentication,
  authorize(PERMISSIONS_V2.EXAMS.READ),
  validation(schema.getExam),
  examsController.getExam,
);

router.get(
  "/user-exams",
  authentication,
  authorize(PERMISSIONS_V2.EXAMS.READ),
  examsController.getStudentExams,
);

router.patch(
  "/:id",
  authentication,
  authorizeResource(examsResource),
  validation(schema.updateHomework), // Note: reusing updateHomework schema if identical, or should be updateExam
  examsController.updateExam,
);

router.get(
  "/",
  authentication,
  authorizeResource(examsResource),
  validation(schema.getAllExams),
  examsController.getAllExams,
);

export default router;
