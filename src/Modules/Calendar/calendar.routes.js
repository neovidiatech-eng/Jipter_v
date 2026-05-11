import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import * as calendarController from "./calendar.controller.js";
import { validation } from "../../Middlewares/Validation.js";
import * as schema from "./calendar.validation.js";
import { endpoints } from "./calender.authoraization.js";
import { authorization } from "../../Middlewares/Authorization.js";
const router = Router();
const adminRoles = ["admin", "super_admin"];

router.get(
  "/",
  authentication,
  authorization({ roles: ["student", "teacher", ...adminRoles] }),
  validation(schema.getCalendar),
  calendarController.getCalendar,
);
router.get(
  "/student",
  authentication,
  authorization({ roles: ["student"], permissions: endpoints.getStudentCalendar }),
  validation(schema.getStudentCalendar),
  calendarController.getStudentCalendar,
);
router.get(
  "/teacher",
  authentication,
  authorization({ roles: ["teacher"], permissions: endpoints.getTeacherCalendar }),
  validation(schema.getTeacherCalendar),
  calendarController.getTeacherCalendar,
);
router.get(
  "/teachers",
  authentication,
  authorization({ roles: adminRoles }),
  validation(schema.getTeachersCalendar),
  calendarController.getTeachersCalendar,
);


export default router;
