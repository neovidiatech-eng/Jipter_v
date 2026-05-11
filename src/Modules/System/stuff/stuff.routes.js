import { Router } from "express";
import * as stuffController from "./stuff.controller.js";
import authentication from "../../../Middlewares/Authentication.js";
import { authorization } from "../../../Middlewares/Authorization.js";
import { endpoints } from "./stuff.authorization.js";

const router = Router();

router.get(
  "/",
  authentication,
  authorization({ permissions: endpoints.getAllStuff }),
  stuffController.getAllStuff,
);
router.get(
  "/:id",
  authentication,
  authorization({ permissions: endpoints.getStuffById }),
  stuffController.getStuffById,
);
router.post(
  "/create",
  authentication,
  authorization({ permissions: endpoints.createStuffUser }),
  stuffController.createStuffUser,
);
router.patch(
  "/update/:id",
  authentication,
  authorization({ permissions: endpoints.updateStuffUser }),
  stuffController.updateStuffUser,
);
router.delete(
  "/delete/:id",
  authentication,
  authorization({ permissions: endpoints.deleteStuffUser }),
  stuffController.deleteStuffUser,
);

export default router;
