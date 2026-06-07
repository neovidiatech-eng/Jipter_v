import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import { authorize } from "../../Middlewares/Authorize.js";
import * as calendarController from "./calendar.controller.js";
import { validation } from "../../Middlewares/Validation.js";
import * as schema from "./calendar.validation.js";
import { PERMISSIONS_V2 } from "../../Constants/permissions.constants.js";

const router = Router();

router.use(authentication);

router.get(
  "/",
  authorize(PERMISSIONS_V2.CALENDAR.READ),
  validation(schema.getCalendar),
  calendarController.getCalendar,
);

router.get(
  "/student",
  authorize(PERMISSIONS_V2.CALENDAR.READ),
  validation(schema.getStudentCalendar),
  calendarController.getStudentCalendar,
);

router.get(
  "/teacher",
  authorize(PERMISSIONS_V2.CALENDAR.READ),
  validation(schema.getTeacherCalendar),
  calendarController.getTeacherCalendar,
);

router.get(
  "/teachers",
  authorize(PERMISSIONS_V2.CALENDAR.READ),
  validation(schema.getTeachersCalendar),
  calendarController.getTeachersCalendar,
);

export default router;
