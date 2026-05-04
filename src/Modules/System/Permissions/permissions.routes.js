import { Router } from "express";
import authentication from "../../../Middlewares/Authentication.js";
import { authorization } from "../../../Middlewares/Authorization.js";
import { validation } from "../../../Middlewares/Validation.js";
import * as permissionsController from "./permissions.controller.js";
import { endpoints } from "./permissions.authorization.js";
import {
  createPermissionSchema,
  deletePermissionSchema,
  updatePermissionSchema,
} from "./permissions.validation.js";

const router = Router();

router.get(
  "/",
  authentication,
  authorization({ accessRoles: endpoints.getAllPermissions }),
  permissionsController.getAllPermissions,
);

router.post(
  "/create",
  authentication,
  authorization({ accessRoles: endpoints.createPermission }),
  validation(createPermissionSchema),
  permissionsController.createPermission,
);

router.patch(
  "/update/:id",
  authentication,
  authorization({ accessRoles: endpoints.updatePermission }),
  validation(updatePermissionSchema),
  permissionsController.updatePermission,
);

router.delete(
  "/:id",
  authentication,
  authorization({ accessRoles: endpoints.deletePermission }),
  validation(deletePermissionSchema),
  permissionsController.deletePermission,
);

export default router;
