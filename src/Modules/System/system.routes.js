import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import { authorizeResource } from "../../Middlewares/AuthorizeResource.js";
import { authorize } from "../../Middlewares/Authorize.js";
import { validation } from "../../Middlewares/Validation.js";
import permissionsRouter from "./Permissions/permissions.routes.js";
import * as systemController from "./system.controller.js";
import { TIMEZONES_LIST } from "../../Utils/Date/timezones.js";
import {
  createRoleSchema,
  deleteRoleSchema,
  updateRoleSchema,
  assignRoleSchema,
} from "./system.validation.js";
import stuffRouter from "./stuff/stuff.routes.js";
import { PERMISSIONS_V2 } from "../../Constants/permissions.constants.js";
import { authorization } from "../../Middlewares/Authorization.js";
import { ROLES } from "../../Utils/Permissions/permissions.js";

const router = Router();
const rolesResource = "roles";

// Public: list all available IANA timezones for dropdown
router.get("/timezones", (req, res) => {
  res.json({ data: TIMEZONES_LIST, status: 200 });
});

router.use("/permissions", permissionsRouter);
router.use("/stuff", stuffRouter);

router.get(
  "/roles",
  authentication,
  authorizeResource(rolesResource),
  systemController.getAllRoles,
);

router.post(
  "/roles/create",
  authentication,
  authorizeResource(rolesResource),
  validation(createRoleSchema),
  systemController.createRole,
);

router.post(
  "/roles/assign/:user_id",
  authentication,
  authorize(PERMISSIONS_V2.ROLES.ASSIGN),
  validation(assignRoleSchema),
  systemController.assignRoleToUser,
);

router.patch(
  "/roles/:id",
  authentication,
  authorizeResource(rolesResource),
  validation(updateRoleSchema),
  systemController.updateRole,
);

router.delete(
  "/roles/:id",
  authentication,
  authorizeResource(rolesResource),
  validation(deleteRoleSchema),
  systemController.deleteRole,
);
router.get("/dashboard", authentication, authorize(PERMISSIONS_V2.DASHBOARD.READ), systemController.getDashboard);
export default router;
