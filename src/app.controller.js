import express from "express";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import morgan from "morgan";
import path from "node:path";
import { globalErrorHandling } from "./Utils/Response.js";
import { langMiddleware } from "./Middlewares/i18n.js";
import {
  notificationQueue,
  redis,
  redisConnection,
} from "./Utils/Radis/Connection.js";
import rootRouter from "./index.routes.js";
import { Server } from "socket.io";
import { init_io } from "./Utils/Socket/index.js";
import { socketAuthentication } from "./Middlewares/SocketAuth.js";
import { createAdapter } from "@socket.io/redis-adapter";
import { initGeoIP } from "./Utils/GeoIP.js";

const bootstrap = async () => {
  const app = express();
  app.set("trust proxy", true);
  const port = process.env.PORT || 6000;

  // Initialize GeoIP database in the background
  initGeoIP().catch((err) => {
    console.error("[GeoIP Init Error]", err);
  });

  // ── ENV DEBUG DUMP (remove after confirming env vars are correct) ──

  // ─────────────────────────────────────────────────────────────────
/*   const allJobs = await notificationQueue.getJobs([
    "waiting",
    "active",
    "delayed",
  ]);
  console.log("All jobs:", allJobs);  */

  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
    : [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "https://dashboard.jupiter-egy.com",
      ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
    }),
  );
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(langMiddleware); // Detect language for all requests
  await redisConnection();
  app.use("/uploads", express.static(path.resolve("./src/uploads")));

  // Root Router
  app.use(rootRouter);

  app.use(globalErrorHandling);

  const apphttp = app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });

  // Initialize Socket.IO
  const io = new Server(apphttp, {
    cors: {
      origin: "*",
      credentials: true,
    },
    allowEIO3: true,
  });

  const pubClient = redis.duplicate();
  const subClient = redis.duplicate();
  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));

  io.use(socketAuthentication);

  init_io(io);
};
export default bootstrap;
