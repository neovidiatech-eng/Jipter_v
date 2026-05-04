import { Router } from "express";
import authentication from "../../../Middlewares/Authentication.js";
import { validation } from "../../../Middlewares/Validation.js";
import * as subjectsController from "./subjects.controller.js";
import {
  createSubjectSchema,
  updateSubjectSchema,
  deleteSubjectSchema,
} from "./subjects.validation.js";
import { authorization } from "../../../Middlewares/Authorization.js";
import { accessRoles } from "./subjects.authorization.js";

const router = Router();

router.get("/", authentication, subjectsController.getSubjects);
router.post(
  "/create",
  authentication,
  authorization({
    accessRoles: accessRoles.create,
  }),
  validation(createSubjectSchema),
  subjectsController.createSubject,
);

router.patch(
  "/update/:id",
  authentication,
  authorization({
    accessRoles: accessRoles.update,
  }),
  validation(updateSubjectSchema),
  subjectsController.updateSubject,
);

router.delete(
  "/delete/:id",
  authentication,
  authorization({
    accessRoles: accessRoles.delete,
  }),
  validation(deleteSubjectSchema),
  subjectsController.deleteSubject,
);

export default router;
