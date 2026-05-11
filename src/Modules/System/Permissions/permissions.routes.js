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
  authorization({ permissions: endpoints.getAllPermissions }),
  permissionsController.getAllPermissions,
);

router.post(
  "/create",
  authentication,
  authorization({ permissions: endpoints.createPermission }),
  validation(createPermissionSchema),
  permissionsController.createPermission,
);

router.patch(
  "/update/:id",
  authentication,
  authorization({ permissions: endpoints.updatePermission }),
  validation(updatePermissionSchema),
  permissionsController.updatePermission,
);

router.delete(
  "/:id",
  authentication,
  authorization({ permissions: endpoints.deletePermission }),
  validation(deletePermissionSchema),
  permissionsController.deletePermission,
);

export default router;
