import { Router } from "express";
import profileRouter from "./Profile/profile.routes.js";


const router = Router();
router.use("/profile", profileRouter);

export default router;