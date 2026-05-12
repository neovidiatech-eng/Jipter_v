import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import { validation } from "../../Middlewares/Validation.js";
import * as scheduleController from "./schedules.controller.js";
import * as schema from "./schedules.validation.js";
import { authorizeResource } from "../../Middlewares/AuthorizeResource.js";
import { authorize } from "../../Middlewares/Authorize.js";
import { PERMISSIONS_V2 } from "../../Constants/permissions.constants.js";

const router = Router();

// Base Resource: sessions
const sessionsResource = "sessions";

router.get(
  "/", 
  authentication,
  authorizeResource(sessionsResource),
  scheduleController.getAllSchedules
);
router.get(
  "/:id", 
  authentication,
  authorizeResource(sessionsResource),
  scheduleController.getScheduleById
);

router.get(
  "/user/schedules",
  authentication,
  authorize(PERMISSIONS_V2.SESSIONS.READ),
  scheduleController.getUserSchedules,
);

router.post(
  "/create-one",
  authentication,
  authorize(PERMISSIONS_V2.SESSIONS.CREATE),
  validation(schema.createSchedule),
  scheduleController.createSchedule,
);

router.post(
  "/create-recurring",
  authentication,
  authorize(PERMISSIONS_V2.SESSIONS.CREATE),
  validation(schema.createRecurringSchedule),
  scheduleController.createRecurringSchedule,
);

router.delete(
  "/:id",
  authentication,
  authorizeResource(sessionsResource),
  validation(schema.deleteSchedule),
  scheduleController.deleteSchedule,
);

router.delete(
  "/group/:parent_recurring_id",
  authentication,
  authorize(PERMISSIONS_V2.SESSIONS.DELETE),
  validation(schema.deleteRecurringGroup),
  scheduleController.deleteRecurringGroup,
);

router.patch(
  "/:id",
  authentication,
  authorizeResource(sessionsResource),
  validation(schema.updateSchedule),
  scheduleController.updateSchedule,
);

router.post(
  "/:id/join",
  authentication,
  authorize(PERMISSIONS_V2.SESSIONS.JOIN),
  validation(schema.joinSession),
  scheduleController.joinSession,
);

router.post(
  "/:id/leave",
  authentication,
  authorize(PERMISSIONS_V2.SESSIONS.LEAVE),
  validation(schema.leaveSession),
  scheduleController.leaveSession,
);

router.post(
  "/:id/review",
  authentication,
  authorize(PERMISSIONS_V2.SESSIONS.JOIN), // Assuming join permission allows review, or use a specific one
  validation(schema.submitReview),
  scheduleController.submitReview,
);

export default router;
