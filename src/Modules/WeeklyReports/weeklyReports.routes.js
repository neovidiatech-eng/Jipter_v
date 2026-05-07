import { Router } from "express";
import * as weeklyReportsController from "./weeklyReports.controller.js";
import * as weeklyReportsValidation from "./weeklyReports.validation.js";
import authentication from "../../Middlewares/Authentication.js";
import { authorization } from "../../Middlewares/Authorization.js";
import { validation } from "../../Middlewares/Validation.js";

const router = Router();

// All routes require authentication
router.use(authentication);

// Teacher routes
router.post(
  "/",
  authorization({ accessRoles: ["teacher"] }),
  validation(weeklyReportsValidation.createReportSchema),
  weeklyReportsController.createReport
);

router.get(
  "/my-reports",
  authorization({ accessRoles: ["teacher"] }),
  weeklyReportsController.getMyReports
);

router.get(
  "/metrics",
  authorization({ accessRoles: ["teacher"] }),
  validation(weeklyReportsValidation.getMetricsSchema),
  weeklyReportsController.getWeeklyMetrics
);

// Admin and Teacher shared routes
router.get(
  "/:id",
  authorization({ accessRoles: ["admin", "super_admin", "teacher"] }),
  validation(weeklyReportsValidation.reportIdSchema),
  weeklyReportsController.getReport
);

router.patch(
  "/:id",
  authorization({ accessRoles: ["teacher"] }),
  validation(weeklyReportsValidation.updateReportSchema),
  weeklyReportsController.updateReport
);

router.delete(
  "/:id",
  authorization({ accessRoles: ["admin", "super_admin"] }),
  validation(weeklyReportsValidation.reportIdSchema),
  weeklyReportsController.deleteReport
);

// Admin only routes
router.get(
  "/",
  authorization({ accessRoles: ["admin", "super_admin"] }),
  weeklyReportsController.getAllReports
);

export default router;
