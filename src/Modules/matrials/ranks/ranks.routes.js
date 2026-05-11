import { Router } from "express";
import * as controller from "./ranks.controller.js";
import authentication from "../../../Middlewares/Authentication.js";
import { validation } from "../../../Middlewares/Validation.js";
import { authorization } from "../../../Middlewares/Authorization.js";
import * as schema from "./ranks.validation.js";
import { auth } from "./ranks.authorizations.js";

const router = Router();

router.get(
  "/",
  authentication,
  authorization({ permissions: auth.getRank }),
  controller.getRanks,
);

router.get(
  "/:id",
  authentication,
  authorization({ permissions: auth.getRank }),
  validation(schema.getRank),
  controller.getRank,
);

router.post(
  "/create",
  authentication,
  authorization({ permissions: auth.createRank }),
  validation(schema.createRank),
  controller.addRank,
);

router.patch(
  "/:id",
  authentication,
  authorization({ permissions: auth.updateRank }),
  validation(schema.updateRank),
  controller.updateRank,
);

router.delete(
  "/:id",
  authentication,
  authorization({ permissions: auth.deleteRank }),
  validation(schema.deleteRank),
  controller.deleteRank,
);

export default router;
