import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import { validation } from "../../Middlewares/Validation.js";
import * as scheduleController from "./schedules.controller.js";
import * as schema from "./schedules.validation.js";

const router = Router();

// Admin: Create multiple sessions for a student with a teacher
router.get("/",authentication,scheduleController.getAllSchedules)
router.get("/user/schedules", authentication, scheduleController.getUserSchedules);
router.post(
  "/create-one",
  authentication,
  validation(schema.createSchedule),
  scheduleController.createSchedule,
);
router.post(
  "/create-recurring",
  authentication,
  validation(schema.createRecurringSchedule),
  scheduleController.createRecurringSchedule,
);


router.delete(
  "/:id",
  authentication,
  validation(schema.deleteSchedule),
  scheduleController.deleteSchedule,
);

router.delete(
  "/group/:parent_recurring_id",
  authentication,
  validation(schema.deleteRecurringGroup),
  scheduleController.deleteRecurringGroup,
);

router.patch(
  "/:id",
  authentication,
  validation(schema.updateSchedule),
  scheduleController.updateSchedule,
);

router.post("/:id/join", authentication,validation(schema.joinSession), scheduleController.joinSession);
router.post("/:id/leave", authentication,validation(schema.leaveSession),scheduleController.leaveSession);
router.post("/:id/review", authentication,validation(schema.submitReview), scheduleController.submitReview);

export default router;
