import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import { validation } from "../../Middlewares/Validation.js";
import { authorization } from "../../Middlewares/Authorization.js";
import * as homeworkController from "./homework.controller.js";
import * as schema from "./homework.validation.js";
import { endpoints } from "./homework.authorization.js";

const router = Router();
const adminRoles = ["admin", "super_admin"];

router.post(
  "/",
  authentication,
  authorization({ roles: ["teacher", ...adminRoles], permissions: endpoints.createHomework }),
  validation(schema.createHomework),
  homeworkController.createHomework,
);

router.patch(
  "/:id",
  authentication,
  authorization({ roles: ["teacher", ...adminRoles], permissions: endpoints.updateHomework }),
  validation(schema.updateHomework),
  homeworkController.updateHomework,
);

router.delete(
  "/:id",
  authentication,
  authorization({ roles: ["teacher", ...adminRoles], permissions: endpoints.deleteHomework }),
  validation(schema.deleteHomework),
  homeworkController.deleteHomework,
);

router.get(
  "/student/:id",
  authentication,
  authorization({ roles: ["teacher", ...adminRoles], permissions: endpoints.getHomework }),
  validation(schema.getHomework),
  homeworkController.getHomework,
);
router.get(
  "/student-homework",
  authentication,
  authorization({ roles: ["student"], permissions: endpoints.getHomework }),
  homeworkController.getStudentHomework,
);

router.get(
  "/",
  authentication,
  authorization({ roles: adminRoles, permissions: endpoints.getHomework }), 
  validation(schema.getAllHomework),
  homeworkController.getAllHomework,
);

export default router;