import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import { validation } from "../../Middlewares/Validation.js";
import { authorizeResource } from "../../Middlewares/AuthorizeResource.js";
import { authorize } from "../../Middlewares/Authorize.js";
import * as homeworkController from "./homework.controller.js";
import * as schema from "./homework.validation.js";
import { PERMISSIONS_V2 } from "../../Constants/permissions.constants.js";
import {
  cloudinaryMulterUpload,
  fileValidation,
} from "../../Utils/Multer/Cloudinary.multer.js";
import { localMulterUpload } from "../../Utils/Multer/local.multer.js";

const router = Router();
const homeworkResource = "homework";

router.post(
  "/",
  authentication,
  authorizeResource(homeworkResource),
  validation(schema.createHomework),
  homeworkController.createHomework,
);

router.post(
  "/:id/submit",
  authentication,

  localMulterUpload({
    validation: [...fileValidation.pdf, ...fileValidation.image],
    maxSize: 10 * 1024 * 1024,
    customPath: "homework",
  }).single("attachments"),
  validation(schema.getHomework),
  homeworkController.submitHomework,
);

router.patch(
  "/:id",
  authentication,
  authorizeResource(homeworkResource),
  validation(schema.updateHomework),
  homeworkController.updateHomework,
);

router.delete(
  "/:id",
  authentication,
  authorizeResource(homeworkResource),
  validation(schema.deleteHomework),
  homeworkController.deleteHomework,
);

router.get(
  "/student/:id",
  authentication,
  authorize(PERMISSIONS_V2.HOMEWORK.READ),
  validation(schema.getHomework),
  homeworkController.getHomework,
);

router.get(
  "/student-homework",
  authentication,
  authorize(PERMISSIONS_V2.HOMEWORK.READ),
  homeworkController.getStudentHomework,
);

router.get(
  "/",
  authentication,
  authorizeResource(homeworkResource),
  validation(schema.getAllHomework),
  homeworkController.getAllHomework,
);

export default router;
