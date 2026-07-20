import { asyncHandler } from "../Utils/Response.js";
import { verifyToken } from "../Utils/Token/token.js";
import * as db from "../database/dbService.js";
import { redis } from "../Utils/Radis/Connection.js";
import { hasPermission, getUserPermissions } from "../Utils/Permissions/permissions.js";
import { applyUserTimezone } from "./Timezone.js";

const authentication = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    const err = new Error("UNAUTHORIZED_NO_TOKEN");
    err.cause = 401;
    err.isMessageKey = true;
    return next(err);
  }
  const [bearer, token] = authorization.split(" ");
  if (!token || !bearer || bearer !== "Bearer") {
    const err = new Error("UNAUTHORIZED_NO_TOKEN");
    err.cause = 401;
    err.isMessageKey = true;
    return next(err);
  }

  const decoded = verifyToken({ token });
  if (!decoded || !decoded.id) {
    const err = new Error("UNAUTHORIZED_INVALID_TOKEN");
    err.cause = 401;
    err.isMessageKey = true;
    return next(err);
  }

  const cacheKey = `user:${decoded.id}`;
  let user;

  // Try to get user from cache
  try {
    const cachedUser = await redis.get(cacheKey);
    if (cachedUser) {
      user = JSON.parse(cachedUser);
    }
  } catch (cacheError) {
    // Continue to DB if cache fails — cache errors are non-fatal
  }

  if (!user) {
    user = await db.findFirst({
      model: "user",
      where: {
        id: decoded.id,
        confirmAt: { not: null },
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
        student: true,
        teacher: true,
      },
    });

    if (user) {
      // Cache for 5 minutes (300 seconds)
      try {
        await redis.set(cacheKey, JSON.stringify(user), { EX: 300 });
      } catch {
        // Cache set failure is non-fatal; continue without caching
      }
    }
  }

  if (!user) {
    const err = new Error("UNAUTHORIZED_ACCOUNT");
    err.cause = 401;
    err.isMessageKey = true;
    return next(err);
  }

  // Attach helper method to check permissions and cache permissions list
  req.permissions = getUserPermissions(user);
  user.hasPermission = (permissionCode) => req.permissions.has(permissionCode);

  req.user = user;

  // Upgrade req.timezone to the user's stored treimezone (overrides GeoIP / header)
  applyUserTimezone(req);

  next();
});

export default authentication;
