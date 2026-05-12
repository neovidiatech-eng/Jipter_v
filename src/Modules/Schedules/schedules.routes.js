import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import { validation } from "../../Middlewares/Validation.js";
import * as scheduleController from "./schedules.controller.js";
import * as schema from "./schedules.validation.js";
import { authorization } from "../../Middlewares/Authorization.js";
import { ROLES } from "../../Utils/Permissions/permissions.js";
import { endpoints } from "./schedules.authorization.js";



const router = Router();

// Admin: Create multiple sessions for a student with a teacher
router.get(
  "/", 
  authentication,
  authorization({ permissions: endpoints.GET_ALL_SCHEDULES,  }),
  scheduleController.getAllSchedules);
router.get(
  "/user/schedules",
  authentication,
  authorization({ permissions: endpoints.GET_ALL_SCHEDULES, roles: [ROLES.STUDENT,ROLES.TEACHER] }),
  scheduleController.getUserSchedules,
);
router.post(
  "/create-one",
  authentication,
  authorization({ permissions: endpoints.CREATE_SCHEDULE, roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] }),
  validation(schema.createSchedule),
  scheduleController.createSchedule,
);
router.post(
  "/create-recurring",
  authentication,
  authorization({ permissions: endpoints.CREATE_SCHEDULE, roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] }),
  validation(schema.createRecurringSchedule),
  scheduleController.createRecurringSchedule,
);

router.delete(
  "/:id",
  authentication,
  authorization({ permissions: endpoints.DELETE_SCHEDULE, roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] }),
  validation(schema.deleteSchedule),
  scheduleController.deleteSchedule,
);

router.delete(
  "/group/:parent_recurring_id",
  authentication,
  authorization({ permissions: endpoints.DELETE_SCHEDULE, roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] }),
  validation(schema.deleteRecurringGroup),
  scheduleController.deleteRecurringGroup,
);

router.patch(
  "/:id",
  authentication,
  authorization({ permissions: endpoints.UPDATE_SCHEDULE, roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] }),
  validation(schema.updateSchedule),
  scheduleController.updateSchedule,
);

router.post(
  "/:id/join",
  authentication,
  authorization({
    roles: [ROLES.STUDENT,ROLES.TEACHER],
    permissions: endpoints.JOIN_SCHEDULE,
  }),
  validation(schema.joinSession),
  scheduleController.joinSession,
);
router.post(
  "/:id/leave",
  authentication,
  authorization({
    roles: [ROLES.STUDENT,ROLES.TEACHER],
    permissions: endpoints.LEAVE_SCHEDULE,
  }),
  validation(schema.leaveSession),
  scheduleController.leaveSession,
);
router.post(
  "/:id/review",
  authentication,
  authorization({
    roles: [ROLES.STUDENT,ROLES.TEACHER],
    permissions: endpoints.SUBMIT_REVIEW,
  }),
  validation(schema.submitReview),
  scheduleController.submitReview,
);

export default router;
