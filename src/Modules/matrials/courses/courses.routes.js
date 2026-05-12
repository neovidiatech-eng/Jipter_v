import { Router } from "express";
import * as coursesController from "./courses.controller.js";
import { validation } from "../../../Middlewares/Validation.js";
import authentication from "../../../Middlewares/Authentication.js";
import { authorizeResource } from "../../../Middlewares/AuthorizeResource.js";
import { authorize } from "../../../Middlewares/Authorize.js";
import * as coursesValidation from "./courses.validation.js";
import {
  fileValidation,
  localMulterUpload,
} from "../../../Utils/Multer/local.multer.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();
const coursesResource = "courses";

router.get("/", coursesController.getAllCourses);

router.get(
  "/:id",
  validation(coursesValidation.courseIdSchema),
  coursesController.getCourse,
);

router.get(
  "/:id/student-progress",
  authentication,
  authorize(PERMISSIONS_V2.COURSES.READ),
  validation(coursesValidation.courseIdSchema),
  coursesController.getCourseLecturesForStudent,
);

router.post(
  "/",
  authentication,
  authorizeResource(coursesResource),
  localMulterUpload({
    customPath: (req) =>
      `courses/${req.body.title.toLowerCase().split(" ").join("_")}`,
    validation: fileValidation.image,
  }).single("image"),
  validation(coursesValidation.createCourseSchema),
  coursesController.createCourse,
);

router.patch(
  "/:id",
  authentication,
  authorizeResource(coursesResource),
  localMulterUpload({
    customPath: "courses",
    validation: fileValidation.image,
  }).single("image"),
  validation(coursesValidation.updateCourseSchema),
  coursesController.updateCourse,
);

router.delete(
  "/:id",
  authentication,
  authorizeResource(coursesResource),
  validation(coursesValidation.courseIdSchema),
  coursesController.deleteCourse,
);

export default router;
