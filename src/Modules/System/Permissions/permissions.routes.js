import { Router } from "express";
import authentication from "../../../Middlewares/Authentication.js";
import { authorizeResource } from "../../../Middlewares/AuthorizeResource.js";
import { authorize } from "../../../Middlewares/Authorize.js";
import { validation } from "../../../Middlewares/Validation.js";
import * as permissionsController from "./permissions.controller.js";
import {
  createPermissionSchema,
  deletePermissionSchema,
  updatePermissionSchema,
  addPermissionsToRoleSchema,
} from "./permissions.validation.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();
const permissionsResource = "permissions";

router.get(
  "/",
  authentication,
  authorizeResource(permissionsResource),
  permissionsController.getAllPermissions,
);

router.post(
  "/create",
  authentication,
  authorizeResource(permissionsResource),
  validation(createPermissionSchema),
  permissionsController.createPermission,
);

router.patch(
  "/update/:id",
  authentication,
  authorizeResource(permissionsResource),
  validation(updatePermissionSchema),
  permissionsController.updatePermission,
);

router.delete(
  "/:id",
  authentication,
  authorizeResource(permissionsResource),
  validation(deletePermissionSchema),
  permissionsController.deletePermission,
);

router.patch(
  "/add-permissions-to-role/:roleId",
  authentication,
  authorize(PERMISSIONS_V2.ROLES.UPDATE), // Updating a role's permissions is a role update
  validation(addPermissionsToRoleSchema),
  permissionsController.addPermissionsToRole,
);

export default router;
