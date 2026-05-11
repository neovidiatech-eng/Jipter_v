import { Router } from "express";
import * as weeklyReportsController from "./weeklyReports.controller.js";
import * as weeklyReportsValidation from "./weeklyReports.validation.js";
import authentication from "../../Middlewares/Authentication.js";
import { authorization } from "../../Middlewares/Authorization.js";
import { validation } from "../../Middlewares/Validation.js";

import { PERMISSIONS } from "../../Utils/Permissions/permissions.js";

const router = Router();

// All routes require authentication
router.use(authentication);

// Teacher routes
router.post(
  "/",
  authorization({ permissions: [PERMISSIONS.WEEKLY_REPORT_CREATE] }),
  validation(weeklyReportsValidation.createReportSchema),
  weeklyReportsController.createReport
);

router.get(
  "/my-reports",
  authorization({ permissions: [PERMISSIONS.WEEKLY_REPORT_READ] }),
  weeklyReportsController.getMyReports
);

router.get(
  "/metrics",
  authorization({ permissions: [PERMISSIONS.WEEKLY_REPORT_READ] }),
  validation(weeklyReportsValidation.getMetricsSchema),
  weeklyReportsController.getWeeklyMetrics
);

// Admin and Teacher shared routes
router.get(
  "/:id",
  authorization({ permissions: [PERMISSIONS.WEEKLY_REPORT_READ, PERMISSIONS.WEEKLY_REPORT_ALL_READ] }),
  validation(weeklyReportsValidation.reportIdSchema),
  weeklyReportsController.getReport
);

router.patch(
  "/:id",
  authorization({ permissions: [PERMISSIONS.WEEKLY_REPORT_UPDATE] }),
  validation(weeklyReportsValidation.updateReportSchema),
  weeklyReportsController.updateReport
);

router.delete(
  "/:id",
  authorization({ permissions: [PERMISSIONS.WEEKLY_REPORT_DELETE] }),
  validation(weeklyReportsValidation.reportIdSchema),
  weeklyReportsController.deleteReport
);

// Admin only routes
router.get(
  "/",
  authorization({ permissions: [PERMISSIONS.WEEKLY_REPORT_ALL_READ] }),
  weeklyReportsController.getAllReports
);

export default router;
