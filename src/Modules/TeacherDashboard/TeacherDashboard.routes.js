import { Router } from "express";
import profileRouter from "./Profile/profile.routes.js";
import transactionsRouter from "./transactions/transactions.routes.js";
import weeklyReportsRouter from "../WeeklyReports/weeklyReports.routes.js";

const router = Router();
router.use("/profile", profileRouter);
router.use("/transactions", transactionsRouter);
router.use("/weekly-reports", weeklyReportsRouter);

export default router;
