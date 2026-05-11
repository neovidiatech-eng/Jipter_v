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

const rootRouter = Router();

// Apply timezone middleware globally
rootRouter.use(timezoneMiddleware);

// ─── 1. Public Routes ────────────────────────────────────────────────────────
rootRouter.use("/auth", authRouter);
rootRouter.use("/uploads", express.static(path.resolve("./src/uploads")));

// ─── 2. Actor Dashboards (Prefix Protected) ──────────────────────────────────
rootRouter.use("/student", authentication, authorization({ roles: ["student"] }), studentDashboardRouter);
rootRouter.use("/teacher", authentication, authorization({ roles: ["teacher"] }), teacherDashboardRouter);

// ─── 3. Shared Features (Root Level for Frontend) ───────────────────────────
// These routers will handle their own internal role-based authorization
rootRouter.use("/requests", authentication, requestsRouter);
rootRouter.use("/homework", authentication, homeworkRouter);
rootRouter.use("/exams", authentication, examRouter);
rootRouter.use("/calendar", authentication, calendarRouter);
rootRouter.use("/schedules", authentication, schedulesRouter);
rootRouter.use("/chat", authentication, chatRouter);

// ─── 4. Management Routes (Admin Protected) ─────────────────────────────────
const adminRoles = ["admin", "super_admin"];
rootRouter.use("/system", authentication, authorization({ roles: adminRoles }), systemRouter);
rootRouter.use("/students", authentication, authorization({ roles: adminRoles }), studentRouter);
rootRouter.use("/teachers", authentication, authorization({ roles: adminRoles }), teacherRouter);
rootRouter.use("/finances", authentication, authorization({ roles: adminRoles }), financesRouter);
rootRouter.use("/materials", authentication, authorization({ roles: adminRoles }), materialsRouter);
rootRouter.use("/weekly-reports", authentication, authorization({ roles: adminRoles }), weeklyReportsRouter);
rootRouter.use("/policies", authentication, authorization({ roles: adminRoles }), policiesRouter);
rootRouter.use("/support", authentication, authorization({ roles: adminRoles }), supportRouter);
rootRouter.use("/withdrawals", authentication, authorization({ roles: adminRoles }), withdrawalsRouter);
rootRouter.use("/transactions", authentication, authorization({ roles: adminRoles }), transactionsRouter);
rootRouter.use("/transactions/currency", authentication, authorization({ roles: adminRoles }), currencyRouter);
rootRouter.use("/settings", authentication, authorization({ roles: adminRoles }), settingsRouter);
rootRouter.use("/subscription", authentication, authorization({ roles: adminRoles }), subscriptionRouter);

// Root health check
rootRouter.get("/", (req, res) => {
  res.json({ message: req.t("WELCOME_MESSAGE") });
});

export default rootRouter;
