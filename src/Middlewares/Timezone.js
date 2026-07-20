import { DEFAULT_TIMEZONE, isValidTimezone } from "../Utils/Date/time.js";
import { getTimezoneFromIp } from "../Utils/GeoIP.js";

/**
 * Middleware to extract and attach user timezone to the request object.
 * 
 * ⚠️  This middleware runs BEFORE authentication, so req.user is not yet
 * available here. Priority order for this early pass:
 * 1. X-Timezone header (explicit client override)
 * 2. Detected timezone from client IP (MaxMind GeoIP)
 * 3. Default (Africa/Cairo)
 *
 * After authentication, call applyUserTimezone(req) to upgrade to
 * the user's stored timezone (highest priority).
 */
const timezoneMiddleware = async (req, res, next) => {
  let tz = null;

  // 1. Check Header (X-Timezone)
  if (req.headers['x-timezone'] && isValidTimezone(req.headers['x-timezone'])) {
    tz = req.headers['x-timezone'];
  }
  // 2. Detect from client IP
  else {
    // Extract IP address from request (handling proxy headers)
    const ip = req.headers['cf-connecting-ip'] || 
               req.headers['x-real-ip'] || 
               (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : null) || 
               req.ip || 
               req.socket?.remoteAddress;

    if (ip) {
      try {
        const detectedTz = await getTimezoneFromIp(ip);
        if (detectedTz && isValidTimezone(detectedTz)) {
          tz = detectedTz;
        }
      } catch (err) {
        console.error("[Timezone Middleware] Error resolving IP timezone:", err);
      }
    }
  }

  // Fallback to default if still not determined
  req.timezone = tz || DEFAULT_TIMEZONE;
  
  next();
};

/**
 * Call this AFTER req.user is populated by authentication.
 * Upgrades req.timezone to the user's stored timezone if available
 * (highest priority — overrides header & GeoIP).
 * @param {import('express').Request} req
 */
export const applyUserTimezone = (req) => {
  if (req.user?.timezone && isValidTimezone(req.user.timezone)) {
    req.timezone = req.user.timezone;
  }
};

export default timezoneMiddleware;
