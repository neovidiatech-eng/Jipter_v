import { Router } from "express";
import * as lecturesController from "./lectures.controller.js";
import { validation } from "../../../Middlewares/Validation.js";
import authentication from "../../../Middlewares/Authentication.js";
import { authorizeResource } from "../../../Middlewares/AuthorizeResource.js";
import { authorize } from "../../../Middlewares/Authorize.js";
import * as lecturesValidation from "./lectures.validation.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();
const lecturesResource = "lectures";

router.get("/", lecturesController.getAllLectures);

router.get(
  "/:id",
  validation(lecturesValidation.lectureIdSchema),
  lecturesController.getLecture,
);

router.post(
  "/",
  authentication,
  authorizeResource(lecturesResource),
  validation(lecturesValidation.createLectureSchema),
  lecturesController.createLecture,
);

router.patch(
  "/:id",
  authentication,
  authorizeResource(lecturesResource),
  validation(lecturesValidation.updateLectureSchema),
  lecturesController.updateLecture,
);

router.delete(
  "/:id",
  authentication,
  authorizeResource(lecturesResource),
  validation(lecturesValidation.lectureIdSchema),
  lecturesController.deleteLecture,
);

router.post(
  "/:id/complete",
  authentication,
  authorizeResource(lecturesResource),
  validation(lecturesValidation.lectureIdSchema),
  lecturesController.completeLecture,
);

export default router;
