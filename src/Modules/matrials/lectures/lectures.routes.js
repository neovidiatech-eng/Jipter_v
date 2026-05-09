import { Router } from "express";
import * as lecturesController from "./lectures.controller.js";
import { validation } from "../../../Middlewares/Validation.js";
import authentication from "../../../Middlewares/Authentication.js";
import { authorization } from "../../../Middlewares/Authorization.js";
import * as lecturesValidation from "./lectures.validation.js";

const router = Router();

const adminOnly = [
  authentication,
  authorization({ accessRoles: ["admin", "super_admin"] }),
];

router.get("/", lecturesController.getAllLectures);
router.get(
  "/:id",
  validation(lecturesValidation.lectureIdSchema),
  lecturesController.getLecture,
);
router.post(
  "/",
  adminOnly,
  validation(lecturesValidation.createLectureSchema),
  lecturesController.createLecture,
);
router.patch(
  "/:id",
  authentication,
  authorization({ accessRoles: ["admin", "super_admin", "teacher"] }),
  validation(lecturesValidation.updateLectureSchema),
  lecturesController.updateLecture,
);
router.delete(
  "/:id",
  adminOnly,
  validation(lecturesValidation.lectureIdSchema),
  lecturesController.deleteLecture,
);

export default router;
