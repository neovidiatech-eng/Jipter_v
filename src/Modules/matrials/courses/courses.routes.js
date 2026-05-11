import { Router } from "express";
import * as coursesController from "./courses.controller.js";
import { validation } from "../../../Middlewares/Validation.js";
import authentication from "../../../Middlewares/Authentication.js";
import { authorization } from "../../../Middlewares/Authorization.js";
import * as coursesValidation from "./courses.validation.js";
import {
  fileValidation,
  localMulterUpload,
} from "../../../Utils/Multer/local.multer.js";

import { PERMISSIONS } from "../../../Utils/Permissions/permissions.js";

const router = Router();

const adminOnly = [
  authentication,
  authorization({ permissions: [PERMISSIONS.COURSE_MANAGE] }),
];

router.get("/", coursesController.getAllCourses); // done
router.get(
  "/:id",
  validation(coursesValidation.courseIdSchema),
  coursesController.getCourse,
); //done
router.get(
  "/:id/student-progress",
  authentication,
  validation(coursesValidation.courseIdSchema),
  coursesController.getCourseLecturesForStudent,
);

router.post(
  "/",
  localMulterUpload({
    customPath: (req) =>
      `courses/${req.body.title.toLowerCase().split(" ").join("_")}`,
    validation: fileValidation.image,
  }).single("image"),
  adminOnly,
  validation(coursesValidation.createCourseSchema),
  coursesController.createCourse,
); //done
router.patch(
  "/:id",
  localMulterUpload({
    customPath: "courses",
    validation: fileValidation.image,
  }).single("image"),
  adminOnly,
  validation(coursesValidation.updateCourseSchema),
  coursesController.updateCourse,
);
router.delete(
  "/:id",
  adminOnly,
  validation(coursesValidation.courseIdSchema),
  coursesController.deleteCourse,
);

export default router;
