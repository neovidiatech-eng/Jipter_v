import {
  asyncHandler,
  errorResponse,
  successResponse,
} from "../../../Utils/Response.js";
import * as db from "../../../database/dbService.js";

export const getAllPermissions = asyncHandler(async (req, res, next) => {
  const { name, code } = req.query;
  let where = {};
  if (name) {
    where.name = name;
  }
  if (code) {
    where.code = code;
  }
  const permissions = await db.findMany({
    model: "permission",
    where,
  });

  const resourcePermissions = groupPermissionsByResource(permissions);
  return successResponse({
    res,
    req,
    message: "FETCH_SUCCESS",
    status: 200,
    data: resourcePermissions,
  });
});

export const createPermission = asyncHandler(async (req, res, next) => {
  const { name, code } = req.body;

  const existsPermission = await db.findOne({
    model: "permission",
    where: {
      code,
    },
  });

  if (existsPermission) {
    return errorResponse({
      req,
      next,
      message: "PERMISSION_EXISTS",
      status: 400,
    });
  }

  const newPermission = await db.create({
    model: "permission",
    data: { name, code },
  });

  return successResponse({
    res,
    req,
    message: "CREATE_SUCCESS",
    status: 201,
    data: newPermission,
  });
});

export const updatePermission = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, code } = req.body;

  const permission = await db.findOne({
    model: "permission",
    where: { id },
  });

  if (!permission) {
    return errorResponse({
      req,
      next,
      message: "PERMISSION_NOT_FOUND",
      status: 404,
    });
  }

  if (name || code) {
    const existsPermission = await db.findFirst({
      model: "permission",
      where: {
        AND: [{ OR: [{ name }, { code }] }, { id: { not: id } }],
      },
    });

    if (existsPermission) {
      return errorResponse({
        req,
        next,
        message: "PERMISSION_EXISTS",
        status: 400,
      });
    }
  }

  const updatedPermission = await db.updateOne({
    model: "permission",
    where: { id },
    data: { name, code },
  });

  return successResponse({
    res,
    req,
    message: "UPDATE_SUCCESS",
    status: 200,
    data: updatedPermission,
  });
});

export const deletePermission = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const permission = await db.findOne({
    model: "permission",
    where: { id },
  });

  if (!permission) {
    return errorResponse({
      req,
      next,
      message: "PERMISSION_NOT_FOUND",
      status: 404,
    });
  }

  await db.deleteOne({
    model: "permission",
    where: { id },
  });

  return successResponse({
    res,
    req,
    status: 200,
    message: "DELETE_SUCCESS",
  });
});

export const addPermissionsToRole = asyncHandler(async (req, res, next) => {
  const { roleId } = req.params;
  const { permissionIds } = req.body;

  const role = await db.findOne({
    model: "role",
    where: { id: roleId },
  });

  if (!role) {
    return errorResponse({
      req,
      next,
      message: "ROLE_NOT_FOUND",
      status: 404,
    });
  }

  const permissions = await db.findMany({
    model: "permission",
    where: {
      id: {
        in: permissionIds,
      },
    },
  });
  const rolePermissions = await db.findMany({
    model: "rolePermission",
    where: {
      roleId: roleId,
      permissionId: {
        in: permissionIds,
      },
    },
    include: {
      permission: true,
    },
  });
  if (rolePermissions.length > 0) {
    return errorResponse({
      next,
      req,
      status: 409,
      message: "ROLE_ALREADY_HAS_PERMISSIONS",
    });
  }

  if (permissions.length !== permissionIds.length) {
    return errorResponse({
      req,
      next,
      message: "PERMISSION_NOT_FOUND",
      status: 404,
    });
  }

  const updatedRole = await db.updateOne({
    model: "role",
    where: { id: roleId },
    data: {
      rolePermissions: {
        create: permissionIds.map((permissionId) => ({
          permission: {
            connect: {
              id: permissionId,
            },
          },
        })),
      },
    },
    select: {
      id: true,
      name: true,
      rolePermissions: {
        select: {
          id: true,
          permission: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
    },
  });

  return successResponse({
    res,
    req,
    message: "UPDATE_SUCCESS",
    status: 200,
    data: updatedRole,
  });
});

const groupPermissionsByResource = (permissions) => {
  return permissions.reduce((acc, permission) => {
    const [resource, action] = permission.code.split(":");

    if (!acc[resource]) {
      acc[resource] = [];
    }

    acc[resource].push({
      id: permission.id,
      name: permission.name,
      code: permission.code,
      action,
    });

    return acc;
  }, {});
};
