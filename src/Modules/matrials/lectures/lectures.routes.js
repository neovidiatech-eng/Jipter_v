import { Router } from "express";
import * as lecturesController from "./lectures.controller.js";
import { validation } from "../../../Middlewares/Validation.js";
import authentication from "../../../Middlewares/Authentication.js";
import { authorization } from "../../../Middlewares/Authorization.js";
import * as lecturesValidation from "./lectures.validation.js";

import { PERMISSIONS } from "../../../Utils/Permissions/permissions.js";

const router = Router();

const adminOnly = [
  authentication,
  authorization({ permissions: [PERMISSIONS.LECTURE_MANAGE] }),
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
  authorization({ permissions: [PERMISSIONS.LECTURE_MANAGE, PERMISSIONS.LECTURE_READ] }),
  validation(lecturesValidation.updateLectureSchema),
  lecturesController.updateLecture,
);
router.delete(
  "/:id",
  adminOnly,
  validation(lecturesValidation.lectureIdSchema),
  lecturesController.deleteLecture,
);
router.post(
  "/:id/complete",
  authentication,
  validation(lecturesValidation.lectureIdSchema),
  lecturesController.completeLecture,
);

export default router;


