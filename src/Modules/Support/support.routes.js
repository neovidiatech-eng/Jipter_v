import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import { authorizeResource } from "../../Middlewares/AuthorizeResource.js";
import { authorize } from "../../Middlewares/Authorize.js";
import { validation } from "../../Middlewares/Validation.js";
import * as controller from "./support.controller.js";
import * as schema from "./support.validation.js";
import { PERMISSIONS_V2 } from "../../Constants/permissions.constants.js";

const router = Router();
const supportResource = "support";

router.use(authentication);

router.get(
  "/",
  authorizeResource(supportResource),
  controller.getSupport,
);

router.get(
  "/teacher",
  authorizeResource(supportResource),
  controller.getTeacherSupport,
);

router.get(
  "/categories",
  authorizeResource(supportResource),
  controller.getCategories,
);

router.get(
  "/:id",
  authorizeResource(supportResource),
  validation(schema.supportIdSchema),
  controller.getSupportById,
);

router.post(
  "/",
  authorizeResource(supportResource),
  validation(schema.createSupport),
  controller.createSupport,
);

router.patch(
  "/:id",
  authorizeResource(supportResource),
  validation(schema.updateSupport),
  controller.updateSupport,
);

router.delete(
  "/:id",
  authorizeResource(supportResource),
  validation(schema.supportIdSchema),
  controller.deleteSupport,
);

// --- Category Routes ---
router.post(
  "/categories",
  authorizeResource(supportResource),
  validation(schema.createCategory),
  controller.createCategory,
);

router.patch(
  "/categories/:id",
  authorizeResource(supportResource),
  validation(schema.updateCategory),
  controller.updateCategory,
);

router.delete(
  "/categories/:id",
  authorizeResource(supportResource),
  validation(schema.categoryIdSchema),
  controller.deleteCategory,
);

export default router;
