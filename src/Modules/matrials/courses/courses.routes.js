import { Router } from "express";
import * as coursesController from "./courses.controller.js";
import { validation } from "../../../Middlewares/Validation.js";
import authentication from "../../../Middlewares/Authentication.js";
import { authorizeResource } from "../../../Middlewares/AuthorizeResource.js";
import * as coursesValidation from "./courses.validation.js";
import {
  fileValidation,
  localMulterUpload,
} from "../../../Utils/Multer/local.multer.js";

const router = Router();
const coursesResource = "courses";

router.get(
  "/",
  authorizeResource(coursesResource),
  coursesController.getAllCourses,
);

router.get(
  "/:id",
  authorizeResource(coursesResource),
  validation(coursesValidation.courseIdSchema),
  coursesController.getCourse,
);

router.get(
  "/:id/student-progress",
  authorizeResource(coursesResource),
  validation(coursesValidation.courseIdSchema),
  coursesController.getCourseLecturesForStudent,
);

router.post(
  "/",
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
  authorizeResource(coursesResource),
  validation(coursesValidation.courseIdSchema),
  coursesController.deleteCourse,
);

export default router;
