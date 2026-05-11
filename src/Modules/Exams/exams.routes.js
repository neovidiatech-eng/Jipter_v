import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import { validation } from "../../Middlewares/Validation.js";
import { authorization } from "../../Middlewares/Authorization.js";
import * as examsController from "./exams.controller.js";
import * as schema from "./exams.validation.js";
import { endpoints } from "./exams.authorization.js";

const router = Router();
const actorRoles = ["student", "teacher"];
const adminRoles = ["admin", "super_admin"];
const allRoles = [...actorRoles, ...adminRoles];

router.post(
  "/",
  authentication,
  authorization({ roles: ["teacher", ...adminRoles], permissions: endpoints.createExam }),
  validation(schema.createExam),
  examsController.createExam,
);

router.delete(
  "/:id",
  authentication,
  authorization({ roles: ["teacher", ...adminRoles], permissions: endpoints.deleteExam }),
  validation(schema.deleteExam),
  examsController.deleteExam,
);

router.get(
  "/exam/:id",
  authentication,
  authorization({ roles: allRoles, permissions: endpoints.getExam }),
  validation(schema.getExam),
  examsController.getExam,
);

router.get(
  "/user-exams",
  authentication,
  authorization({ roles: actorRoles, permissions: endpoints.getStudentExam }),
  examsController.getStudentExams,
);

router.patch(
  "/:id",
  authentication,
  authorization({ roles: ["teacher", ...adminRoles], permissions: endpoints.updateHomework }),
  validation(schema.updateHomework),
  examsController.updateExam,
);

router.get(
  "/",
  authentication,
  authorization({ roles: adminRoles, permissions: endpoints.getAllExams }), 
  validation(schema.getAllExams),
  examsController.getAllExams,
);

export default router;
