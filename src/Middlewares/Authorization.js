import { asyncHandler } from "../Utils/Response.js";
import { findFirst } from "../database/dbService.js";

export const authorization = ({ accessRoles = [] }) => {
  return asyncHandler(async (req, res, next) => {
    const userRole = req.user.role;

    console.log(accessRoles[0]);
    


    if (!userRole) {
      return next(new Error("Unauthorized: Role not found", { cause: 401 }));
    }

    if (!accessRoles.includes(userRole.name)) {
      return next(new Error("Forbidden: You do not have permission", { cause: 403 }));
    }
    
    next();
  });
};
