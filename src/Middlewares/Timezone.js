import { DEFAULT_TIMEZONE, isValidTimezone } from "../Utils/Date/time.js";
import { getTimezoneFromIp } from "../Utils/GeoIP.js";

/**
 * Middleware to extract and attach user timezone to the request object.
 * Priority: 
 * 1. Logged-in user profile
 * 2. X-Timezone header
 * 3. Detected timezone from client IP (MaxMind GeoIP)
 * 4. Default (Africa/Cairo)
 */
const timezoneMiddleware = async (req, res, next) => {
  let tz = null;

  // 1. Check logged-in user
  if (req.user && req.user.timezone) {
    tz = req.user.timezone;
  } 
  // 2. Check Header
  else if (req.headers['x-timezone'] && isValidTimezone(req.headers['x-timezone'])) {
    tz = req.headers['x-timezone'];
  }
  // 3. Detect from client IP
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

export default timezoneMiddleware;
