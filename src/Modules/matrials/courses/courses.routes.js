import { Router } from "express";
import * as coursesController from "./courses.controller.js";
import { validation } from "../../../Middlewares/Validation.js";
import authentication from "../../../Middlewares/Authentication.js";
import { authorization } from "../../../Middlewares/Authorization.js";
import * as coursesValidation from "./courses.validation.js";

const router = Router();

const adminOnly = [authentication, authorization({ accessRoles: ["admin", "super_admin"] })];

router.get("/", coursesController.getAllCourses); // done 
router.get("/:id", validation(coursesValidation.courseIdSchema), coursesController.getCourse);//done
router.post("/", adminOnly, validation(coursesValidation.createCourseSchema), coursesController.createCourse);  //done
router.patch("/:id", adminOnly, validation(coursesValidation.updateCourseSchema), coursesController.updateCourse);
router.delete("/:id", adminOnly, validation(coursesValidation.courseIdSchema), coursesController.deleteCourse);

export default router;
