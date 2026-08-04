import { Router } from "express";
import * as auth from "./auth.controller.js";
import cookieParser from "cookie-parser";
import { validation } from "../../Middlewares/Validation.js";
import {
  authRateLimiter,
  otpRateLimiter,
  sensitiveRateLimiter,
} from "../../Middlewares/RateLimiter.js";
import {
  forgetPasswordSchema,
  loginSchema,
  registeritonSchema,
  resendOtpSchema,
  resetPasswordSchema,
  verifiyCodeSchema,
} from "./auth.validation.js";

const router = Router();

router.post("/sign-up", authRateLimiter, validation(registeritonSchema), auth.register);

router.post("/sign-in", authRateLimiter, validation(loginSchema), auth.login);

router.post("/refresh", authRateLimiter, cookieParser(), auth.refresh);


router.post(
  "/verify-account",
  otpRateLimiter,
  validation(verifiyCodeSchema),
  auth.verifyAccount,
);

router.post("/resend-otp", otpRateLimiter, validation(resendOtpSchema), auth.resendOtp);

router.post(
  "/forget-password",
  sensitiveRateLimiter,
  validation(forgetPasswordSchema),
  auth.forgetPassword,
);

router.patch(
  "/reset-password",
  sensitiveRateLimiter,
  validation(resetPasswordSchema),
  auth.resetPassword,
);

export default router;
