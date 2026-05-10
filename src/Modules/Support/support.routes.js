import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import { authorization } from "../../Middlewares/Authorization.js";
import { validation } from "../../Middlewares/Validation.js";
import * as controller from "./support.controller.js";
import * as schema from "./support.validation.js";
import { endpoints } from "./support.authorization.js";

const router = Router();

// Publicly available for authenticated users (Students, Teachers, Admins)
router.use(authentication);

// --- Support Routes ---
router.get(
  "/",
  authorization({ accessRoles: endpoints.getSupport }),
  controller.getSupport
);
router.get(
  "/teacher",
  authorization({ accessRoles: endpoints.manageSupport }),
  controller.getTeacherSupport
);

router.get(
  "/:id",
  authorization({ accessRoles: endpoints.getSupport }),
  validation(schema.supportIdSchema),
  controller.getSupportById
);

router.post(
  "/",
  authorization({ accessRoles: endpoints.manageSupport }),
  validation(schema.createSupport),
  controller.createSupport
);

router.patch(
  "/:id",
  authorization({ accessRoles: endpoints.manageSupport }),
  validation(schema.updateSupport),
  controller.updateSupport
);

router.delete(
  "/:id",
  authorization({ accessRoles: endpoints.manageSupport }),
  validation(schema.supportIdSchema),
  controller.deleteSupport
);


// --- Category Routes ---
router.get(
  "/categories",
  authorization({ accessRoles: endpoints.getSupport }),
  controller.getCategories
);

router.post(
  "/categories",
  authorization({ accessRoles: endpoints.manageSupport }),
  validation(schema.createCategory),
  controller.createCategory
);

router.patch(
  "/categories/:id",
  authorization({ accessRoles: endpoints.manageSupport }),
  validation(schema.updateCategory),
  controller.updateCategory
);

router.delete(
  "/categories/:id",
  authorization({ accessRoles: endpoints.manageSupport }),
  validation(schema.categoryIdSchema),
  controller.deleteCategory
);

export default router;
