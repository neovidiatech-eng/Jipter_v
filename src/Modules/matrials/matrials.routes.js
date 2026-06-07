import { Router } from "express";
import rankRouter from "./ranks/ranks.routes.js";
import coursesRouter from "./courses/courses.routes.js";
import lecturesRouter from "./lectures/lectures.routes.js";

const router = Router();

router.use("/ranks", rankRouter);
router.use("/courses", coursesRouter);
router.use("/lectures", lecturesRouter);

export default router;