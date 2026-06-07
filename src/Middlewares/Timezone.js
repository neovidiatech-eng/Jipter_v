import { DEFAULT_TIMEZONE, isValidTimezone } from "../Utils/Date/time.js";

/**
 * Middleware to extract and attach user timezone to the request object.
 * Priority: 
 * 1. Logged-in user profile
 * 2. X-Timezone header
 * 3. Default (Africa/Cairo)
 */
const timezoneMiddleware = (req, res, next) => {
  let tz = DEFAULT_TIMEZONE;

  // 1. Check logged-in user
  if (req.user && req.user.timezone) {
    tz = req.user.timezone;
  } 
  // 2. Check Header
  else if (req.headers['x-timezone'] && isValidTimezone(req.headers['x-timezone'])) {
    tz = req.headers['x-timezone'];
  }

  // Attach to request object
  req.timezone = tz;
  
  next();
};

export default timezoneMiddleware;
