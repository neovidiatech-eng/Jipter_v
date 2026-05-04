import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import * as calendarController from "./calendar.controller.js";
import { validation } from "../../Middlewares/Validation.js";
import * as schema from "./calendar.validation.js";
import { endpoints } from "./calender.authoraization.js";
import { authorization } from "../../Middlewares/Authorization.js";
const router = Router();
router.get(
  "/",
  authentication,
  validation(schema.getCalendar),
  calendarController.getCalendar,
);
router.get(
  "/student",
  authentication,
  authorization({ accessRoles: endpoints.getStudentCalendar }),
  validation(schema.getStudentCalendar),
  calendarController.getStudentCalendar,
);
router.get(
  "/teacher",
  authentication,
  authorization({ accessRoles: endpoints.getTeacherCalendar }),
  validation(schema.getTeacherCalendar),
  calendarController.getTeacherCalendar,
);
router.get(
  "/teachers",
  authentication,
  validation(schema.getTeachersCalendar),
  calendarController.getTeachersCalendar,
);


export default router;
