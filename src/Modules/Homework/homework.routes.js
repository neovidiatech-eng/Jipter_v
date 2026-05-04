import { Router } from "express";
import { authentication } from "../../Middlewares/Authentication.js";
import { validation } from "../../Middlewares/Validation.js";
import { authorization } from "../../Middlewares/Authorization.js";
import * as homeworkController from "./homework.controller.js";
import * as schema from "./homework.validation.js";
import { endpoints } from "./homework.authorization.js";

const router = Router();

router.post(
  "/",
  authentication(),
  authorization({ accessRoles: endpoints.createHomework }),
  validation(schema.createHomework),
  homeworkController.createHomework,
);

router.patch(
  "/:id",
  authentication(),
  authorization({ accessRoles: endpoints.updateHomework }),
  validation(schema.updateHomework),
  homeworkController.updateHomework,
);

router.delete(
  "/:id",
  authentication(),
  authorization({ accessRoles: endpoints.deleteHomework }),
  validation(schema.deleteHomework),
  homeworkController.deleteHomework,
);

router.get(
  "/student/:id",
  authentication(),
  authorization({ accessRoles: endpoints.getHomework }),
  validation(schema.getHomework),
  homeworkController.getHomework,
);
router.get(
  "/student-homework",
  authentication(),
  authorization({ accessRoles: endpoints.getHomework }),
  homeworkController.getStudentHomework,
);

router.get(
  "/",
  authentication(),
  authorization({ accessRoles: endpoints.getHomework }), // Sharing getHomework roles for list as well
  validation(schema.getAllHomework),
  homeworkController.getAllHomework,
);

export default router;