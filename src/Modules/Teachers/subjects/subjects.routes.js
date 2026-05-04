import { Router } from "express";
import { authentication } from "../../../Middlewares/Authentication.js";
import { validation } from "../../../Middlewares/Validation.js";
import * as subjectsController from "./subjects.controller.js";
import {
  createSubjectSchema,
  updateSubjectSchema,
  deleteSubjectSchema,
} from "./subjects.validation.js";

const router = Router();

router.get("/", authentication(), subjectsController.getSubjects);
router.post(
  "/create",
  authentication(),
  validation(createSubjectSchema),
  subjectsController.createSubject,
);

router.patch(
  "/update/:id",
  authentication(),
  validation(updateSubjectSchema),
  subjectsController.updateSubject,
);

router.delete(
  "/delete/:id",
  authentication(),
  validation(deleteSubjectSchema),
  subjectsController.deleteSubject,
);

export default router;
