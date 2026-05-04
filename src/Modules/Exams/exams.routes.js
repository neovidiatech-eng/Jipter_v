import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import { validation } from "../../Middlewares/Validation.js";
import { authorization } from "../../Middlewares/Authorization.js";
import * as examsController from "./exams.controller.js";
import * as schema from "./exams.validation.js";
import { endpoints } from "./exams.authorization.js";

const router = Router();
//done
router.post(
  "/",
  authentication,
  authorization({ accessRoles: endpoints.createExam }),
  validation(schema.createExam),
  examsController.createExam,
);
router.delete(
  "/:id",
  authentication,
  authorization({ accessRoles: endpoints.deleteExam }),
  validation(schema.deleteExam),
  examsController.deleteExam,
);
router.get(
  "/exam/:id",
  authentication,
  authorization({ accessRoles: endpoints.getExam }),
  validation(schema.getExam),
  examsController.getExam,
);
router.get(
  "/user-exams",
  authentication,
  authorization({ accessRoles: endpoints.getStudentExam }),
  examsController.getStudentExams,
);
router.patch(
  "/:id",
  authentication,
  authorization({ accessRoles: endpoints.updateHomework }),
  validation(schema.updateHomework),
  examsController.updateExam,
);

router.get(
  "/",
  authentication,
  authorization({ accessRoles: endpoints.getAllExams }), // Sharing getHomework roles for list as well
  validation(schema.getAllExams),
  examsController.getAllExams,
);

export default router;
