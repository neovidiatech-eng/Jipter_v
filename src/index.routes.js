import { Router } from "express";
import path from "node:path";
import express from "express";

// Middleware imports
import authentication from "./Middlewares/Authentication.js";
import { authorization } from "./Middlewares/Authorization.js";
import timezoneMiddleware from "./Middlewares/Timezone.js";

// Router imports
import authRouter from "./Modules/Authentication/auth.routes.js";
import currencyRouter from "./Modules/Transactions/Currency/currency.routes.js";
import subscriptionRouter from "./Modules/Subscription/subscription.routes.js";
import systemRouter from "./Modules/System/system.routes.js";
import teacherRouter from "./Modules/Teachers/teachers.routes.js";
import studentRouter from "./Modules/Students/students.routes.js";
import schedulesRouter from "./Modules/Schedules/schedules.routes.js";
import calendarRouter from "./Modules/Calendar/calendar.routes.js";
import financesRouter from "./Modules/Finances/finances.routes.js";
import studentDashboardRouter from "./Modules/StudentDashboard/studentDashboard.routes.js";
import homeworkRouter from "./Modules/Homework/homework.routes.js";
import examRouter from "./Modules/Exams/exams.routes.js";
import requestsRouter from "./Modules/Requests/requests.routes.js";
import teacherDashboardRouter from "./Modules/TeacherDashboard/TeacherDashboard.routes.js";
import transactionsRouter from "./Modules/Transactions/Transactions/Transactions.routes.js";
import withdrawalsRouter from "./Modules/Withdrawals/withdrawals.routes.js";
import chatRouter from "./Modules/chat/chat.routes.js";
import settingsRouter from "./Modules/Settings/settings.routes.js";
import materialsRouter from "./Modules/matrials/matrials.routes.js";
import weeklyReportsRouter from "./Modules/WeeklyReports/weeklyReports.routes.js";
import policiesRouter from "./Modules/Policies/policies.routes.js";
import supportRouter from "./Modules/Support/support.routes.js";

import { ROLES, ADMIN_ROLES } from "./Utils/Permissions/permissions.js";

const rootRouter = Router();

// Apply timezone middleware globally
rootRouter.use(timezoneMiddleware);

// ─── 1. Public Routes ────────────────────────────────────────────────────────
rootRouter.use("/auth", authRouter);
rootRouter.use("/uploads", express.static(path.resolve("./src/uploads")));

// ─── 2. Actor Dashboards (Prefix Protected) ──────────────────────────────────
rootRouter.use("/student", authentication, authorization({ roles: [ROLES.STUDENT] }), studentDashboardRouter);
rootRouter.use("/teacher", authentication, authorization({ roles: [ROLES.TEACHER] }), teacherDashboardRouter);

// ─── 3. Shared Features (Root Level for Frontend) ───────────────────────────
// These routers will handle their own internal role-based authorization
rootRouter.use("/requests", authentication, requestsRouter);
rootRouter.use("/homework", authentication, homeworkRouter);
rootRouter.use("/exams", authentication, examRouter);
rootRouter.use("/calendar", authentication, calendarRouter);
rootRouter.use("/schedules", authentication, schedulesRouter);
rootRouter.use("/chat", authentication, chatRouter);

// ─── 4. Management Routes (Admin Protected) ─────────────────────────────────
rootRouter.use("/system", authentication, systemRouter);
rootRouter.use("/students", authentication, studentRouter);
rootRouter.use("/teachers", authentication, teacherRouter);
rootRouter.use("/finances", authentication, financesRouter);
rootRouter.use("/materials", authentication, materialsRouter);
rootRouter.use("/weekly-reports", authentication, weeklyReportsRouter);
rootRouter.use("/policies", authentication, policiesRouter);
rootRouter.use("/support", authentication, supportRouter);
rootRouter.use("/withdrawals", authentication, withdrawalsRouter);
rootRouter.use("/transactions", authentication, transactionsRouter);
rootRouter.use("/transactions/currency", authentication, currencyRouter);
rootRouter.use("/settings", authentication, settingsRouter);
rootRouter.use("/subscription", subscriptionRouter);

// Root health check
rootRouter.get("/", (req, res) => {
  res.json({ message: req.t("WELCOME_MESSAGE") });
});

export default rootRouter;
