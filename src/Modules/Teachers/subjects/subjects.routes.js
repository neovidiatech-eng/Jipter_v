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
import { endpoints } from "./subjects.authorization.js";

const router = Router();

router.get("/", authentication, subjectsController.getSubjects);
router.post(
  "/create",
  authentication,
  authorization({
    permissions: endpoints.create,
  }),
  validation(createSubjectSchema),
  subjectsController.createSubject,
);

router.patch(
  "/update/:id",
  authentication,
  authorization({
    permissions: endpoints.update,
  }),
  validation(updateSubjectSchema),
  subjectsController.updateSubject,
);

router.delete(
  "/delete/:id",
  authentication,
  authorization({
    permissions: endpoints.delete,
  }),
  validation(deleteSubjectSchema),
  subjectsController.deleteSubject,
);

export default router;
