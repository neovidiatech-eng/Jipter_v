import { Router } from "express";
import path from "node:path";
import express from "express";

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
import sessionRequestsRouter from "./Modules/SessionRequests/sessionRequests.routes.js";
import teacherDashboardRouter from "./Modules/TeacherDashboard/TeacherDashboard.routes.js";
import transactionsRouter from "./Modules/Transactions/Transactions/Transactions.routes.js";
import withdrawalsRouter from "./Modules/Withdrawals/withdrawals.routes.js";
import chatRouter from "./Modules/chat/chat.routes.js";
import settingsRouter from "./Modules/Settings/settings.routes.js";
import materialsRouter from "./Modules/matrials/matrials.routes.js";
import weeklyReportsRouter from "./Modules/WeeklyReports/weeklyReports.routes.js";
import policiesRouter from "./Modules/Policies/policies.routes.js";

import timezoneMiddleware from "./Middlewares/Timezone.js";

const rootRouter = Router();

// Apply timezone middleware globally
rootRouter.use(timezoneMiddleware);

// API Routes
rootRouter.use("/auth", authRouter);
rootRouter.use("/transactions/currency", currencyRouter);
rootRouter.use("/transactions", transactionsRouter);
rootRouter.use("/subscription", subscriptionRouter);
rootRouter.use("/system", systemRouter);
rootRouter.use("/students", studentRouter);
rootRouter.use("/teachers", teacherRouter);
rootRouter.use("/schedules", schedulesRouter);
rootRouter.use("/calendar", calendarRouter);
rootRouter.use("/finances", financesRouter);
rootRouter.use("/student", studentDashboardRouter);
rootRouter.use("/teacher", teacherDashboardRouter);
rootRouter.use("/homework", homeworkRouter);
rootRouter.use("/exams", examRouter);
rootRouter.use("/session-requests", sessionRequestsRouter);
rootRouter.use("/withdrawals", withdrawalsRouter);
rootRouter.use("/chat", chatRouter);
rootRouter.use("/settings", settingsRouter);
rootRouter.use("/materials", materialsRouter);
rootRouter.use("/weekly-reports", weeklyReportsRouter);
rootRouter.use("/policies", policiesRouter);

 
// Static files
rootRouter.use("/uploads", express.static(path.resolve("./src/uploads")));

// Root health check
rootRouter.get("/", (req, res) => {
  res.json({ message: req.t("WELCOME_MESSAGE") });
});

export default rootRouter;
