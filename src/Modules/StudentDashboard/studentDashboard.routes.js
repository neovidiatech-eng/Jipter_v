import { Router } from "express";
import profileRouter from "./Profile/profile.routes.js";
import dashboardRouter from "./dashboard/dashboard.routes.js";


const router = Router();
router.use("/profile", profileRouter);
router.use("/dashboard", dashboardRouter);
export default router;