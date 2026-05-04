import { Router } from "express";
import { authentication } from "../../Middlewares/Authentication.js";
import { authorization } from "../../Middlewares/Authorization.js";
import { validation } from "../../Middlewares/Validation.js";
import permissionsRouter from "./Permissions/permissions.routes.js";
import * as systemController from "./system.controller.js";
import { endpoints } from "./system.authorization.js";
import {
  createRoleSchema,
  deleteRoleSchema,
  updateRoleSchema,
  assignRoleSchema,
} from "./system.validation.js";
import stuffRouter from "./stuff/stuff.routes.js";

const router = Router();

router.use("/permissions", permissionsRouter);
router.use("/stuff", stuffRouter);

router.get(
  "/roles",
  authentication(),
  authorization({ accessRoles: endpoints.getAllRoles }),
  systemController.getAllRoles,
);

router.post(
  "/roles/create",
  authentication(),
  authorization({ accessRoles: endpoints.createRoles }),
  validation(createRoleSchema),
  systemController.createRole,
);

router.post(
  "/roles/assign/:user_id",
  authentication(),
  authorization({ accessRoles: endpoints.assignRole }),
  validation(assignRoleSchema),
  systemController.assignRoleToUser,
);

router.patch(
  "/roles/:id",
  authentication(),
  authorization({ accessRoles: endpoints.updateRole }),
  validation(updateRoleSchema),
  systemController.updateRole,
);

router.delete(
  "/roles/:id",
  authentication(),
  authorization({ accessRoles: endpoints.deleteRole }),
  validation(deleteRoleSchema),
  systemController.deleteRole,
);

export default router;
