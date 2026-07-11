import rateLimit from "express-rate-limit";

// ── Shared handler ────────────────────────────────────────────────────────────
const rateLimitHandler = (message) => (req, res) => {
  res.status(429).json({ success: false, status: 429, message });
};

// ── Global limiter – applied to ALL routes ────────────────────────────────────
// 200 requests per 15 minutes per IP
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("Too many requests, please slow down and try again later."),
});

// ── Auth routes limiter ───────────────────────────────────────────────────────
// 20 requests per 15 minutes per IP (login, register, refresh)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("Too many attempts, please try again after 15 minutes."),
});

// ── OTP / verification limiter ────────────────────────────────────────────────
// 5 requests per hour per IP (verify-account, resend-otp)
export const otpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("Too many OTP requests, please try again after an hour."),
});

// ── Sensitive actions limiter ─────────────────────────────────────────────────
// 10 requests per hour per IP (forget-password, reset-password)
export const sensitiveRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("Too many password reset attempts, please try again after an hour."),
});
