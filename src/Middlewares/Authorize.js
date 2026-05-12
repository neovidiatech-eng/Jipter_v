import { asyncHandler } from "../Utils/Response.js";
import { isAdmin } from "../Utils/Permissions/permissions.js";

/**
 * Enterprise-style Authorization Middleware.
 * Validates if the authenticated user has the required permission code.
 * 
 * @param {string} permissionCode - The permission code in 'resource:action' format.
 */
export const authorize = (permissionCode) => {
  return asyncHandler(async (req, res, next) => {
    const user = req.user;

    if (!user) {
      return next(new Error("Unauthorized", { cause: 401 }));
    }

    // Super Admin / Admin bypass
    if (isAdmin(user)) {
      return next();
    }

    // Check if user has the specific permission
    console.log("*************************");
    console.log(req.permissions);
    console.log("*************************");
    console.log(req.permissions.has(permissionCode));
    
    if (!req.permissions.has(permissionCode)) {
      console.log("*************************");
      
      return next(new Error(`Forbidden: Missing required permission [${permissionCode}]`, { cause: 403 }));
    }

    next();
  });
};
