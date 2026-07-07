import { asyncHandler } from "../Utils/Response.js";
import { hasAnyPermission } from "../Utils/Permissions/permissions.js";

/**
 * Permission and Role-based authorization middleware.
 *
 * @param {string[]} permissions - One or more permission codes required (OR logic).
 * @param {string[]} roles - One or more role names required (Strict context check).
 *
 * Usage:
 *   authorization({ 
 *     roles: ["student"], 
 *     permissions: [PERMISSIONS.STUDENT_PROFILE_READ] 
 *   })
 */
export const authorization = ({ permissions = [], roles = [] }) => {
  return asyncHandler(async (req, res, next) => {
    // 1. Role Context Check (Strict)
    // If specific roles are required, the user MUST have one of those roles.
    if (roles.length > 0) {
      const userRoleName = req.user?.role?.name;
      if (!roles.includes(userRoleName)) {
        const err = new Error("FORBIDDEN_ROLE");
        err.cause = 403;
        err.isMessageKey = true;
        return next(err);
      }
    }

    // 2. Permission Check
    // If permissions are specified, check if the user has AT LEAST ONE.
    if (permissions.length > 0) {
      const hasPermission = hasAnyPermission(req.user, permissions);

      if (!hasPermission) {
        const err = new Error("FORBIDDEN_PERMISSION");
        err.cause = 403;
        err.isMessageKey = true;
        return next(err);
      }
    }

    next();
  });
};
