import { Router } from "express";
import * as weeklyReportsController from "./weeklyReports.controller.js";
import * as weeklyReportsValidation from "./weeklyReports.validation.js";
import authentication from "../../Middlewares/Authentication.js";
import { authorizeResource } from "../../Middlewares/AuthorizeResource.js";
import { authorize } from "../../Middlewares/Authorize.js";
import { validation } from "../../Middlewares/Validation.js";
import { PERMISSIONS_V2 } from "../../Constants/permissions.constants.js";

const router = Router();
const weeklyReportsResource = "weekly_reports";

router.use(authentication);

router.post(
  "/",
  authorize(PERMISSIONS_V2.WEEKLY_REPORTS.CREATE),
  validation(weeklyReportsValidation.createReportSchema),
  weeklyReportsController.createReport
);

router.get(
  "/my-reports",
  authorize(PERMISSIONS_V2.WEEKLY_REPORTS.READ),
  weeklyReportsController.getMyReports
);

router.get(
  "/metrics",
  authorize(PERMISSIONS_V2.WEEKLY_REPORTS.READ),
  validation(weeklyReportsValidation.getMetricsSchema),
  weeklyReportsController.getWeeklyMetrics
);

router.get(
  "/:id",
  authorize(PERMISSIONS_V2.WEEKLY_REPORTS.READ),
  validation(weeklyReportsValidation.reportIdSchema),
  weeklyReportsController.getReport
);

router.patch(
  "/:id",
  authorizeResource(weeklyReportsResource),
  validation(weeklyReportsValidation.updateReportSchema),
  weeklyReportsController.updateReport
);

router.delete(
  "/:id",
  authorizeResource(weeklyReportsResource),
  validation(weeklyReportsValidation.reportIdSchema),
  weeklyReportsController.deleteReport
);

router.get(
  "/",
  authorize(PERMISSIONS_V2.WEEKLY_REPORTS.READ),
  weeklyReportsController.getAllReports
);

export default router;
