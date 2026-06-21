import { Router } from "express";
import * as auth from "./auth.controller.js";
import cookieParser from "cookie-parser";
import { validation } from "../../Middlewares/Validation.js";
import {
  forgetPasswordSchema,
  loginSchema,
  registeritonSchema,
  resendOtpSchema,
  resetPasswordSchema,
  verifiyCodeSchema,
} from "./auth.validation.js";
const router = Router();

router.post("/sign-up", validation(registeritonSchema), auth.register);

router.post("/sign-in", validation(loginSchema), auth.login); //done

router.post("/refresh", cookieParser(), auth.refresh); //done

/* router.post(
  "/google-signup",
  validation(googleSignupSchema),
  auth.googleSignUp,
);

router.post("/google-login", validation(googleLoginSchema), auth.googlelogin); //done
 */
router.post(
  "/verify-account",
  validation(verifiyCodeSchema),
  auth.verifyAccount,
); //done

router.post("/resend-otp", validation(resendOtpSchema), auth.resendOtp);
router.post(
  "/forget-password",
  validation(forgetPasswordSchema),
  auth.forgetPassword,
);

router.patch(
  "/reset-password",
  validation(resetPasswordSchema),
  auth.resetPassword,

);


export default router;
