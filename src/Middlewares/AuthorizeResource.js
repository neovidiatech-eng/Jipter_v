import { asyncHandler } from "../Utils/Response.js";
import { mapMethodToAction } from "../Utils/Permissions/mapMethodToAction.js";
import { isAdmin } from "../Utils/Permissions/permissions.js";

/**
 * Dynamic Resource-based Authorization Middleware.
 * Automatically generates permission code based on the resource name and HTTP method.
 * 
 * Example: authorizeResource("users") + GET => users:read
 * 
 * @param {string} resource - The name of the resource (e.g., 'users', 'courses').
 */
export const authorizeResource = (resource) => {
  return asyncHandler(async (req, res, next) => {
    const user = req.user;

    if (!user) {
      const err = new Error("UNAUTHORIZED_NO_TOKEN");
      err.cause = 401;
      err.isMessageKey = true;
      return next(err);
    }

    // Super Admin / Admin bypass
    if (isAdmin(user)) {
      return next();
    }

    // Dynamically generate permission code: resource:action
    const action = mapMethodToAction(req.method);
    const permissionCode = `${resource}:${action}`;

    // Validate permission
    if (!req.permissions.has(permissionCode)) {
      const err = new Error("FORBIDDEN_PERMISSION");
      err.cause = 403;
      err.isMessageKey = true;
      return next(err);
    }

    next();
  });
};
