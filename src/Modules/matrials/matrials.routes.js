import { Router } from "express";
import rankRouter from "./ranks/ranks.routes.js";

const router = Router();

router.use("/ranks", rankRouter);

export default router;