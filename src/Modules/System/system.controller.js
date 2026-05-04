import {
  asyncHandler,
  errorResponse,
  successResponse,
} from "../../Utils/Response.js";
import * as db from "../../database/dbService.js";

export const getAllRoles = asyncHandler(async (req, res, next) => {
  const { search } = req.query;
  let where = {};
  if (search) {
    where.name = {
      contains: search,
    };
  }
  const roles = await db.findMany({ model: "role", where });
  return successResponse({
    res,
    req,
    status: 200,
    message: "FETCH_SUCCESS",
    data: roles,
  });
});
export const createRole = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    return errorResponse({
      req,
      next,
      message: "MISSING_NAME",
      status: 400,
    });
  }
  const existsRole = await db.findOne({
    model: "role",
    where: {
      name,
    },
  });
  if (existsRole) {
    return errorResponse({
      req,
      next,
      message: "ROLE_EXISTS",
      status: 400,
    });
  }
  const newRole = await db.create({
    model: "role",
    data: {
      name,
    },
  });
  return successResponse({
    res,
    req,
    status: 200,
    message: "CREATE_SUCCESS",
    data: newRole,
  });
});

export const assignRoleToUser = asyncHandler(async (req, res, next) => {
  const { user_id } = req.params;
  const { role_id } = req.body;

  if (!role_id) {
    return errorResponse({
      req,
      next,
      message: "MISSING_ROLE_ID",
      status: 400,
    });
  }
  const existsRole = await db.findOne({
    model: "role",
    where: {
      id: role_id,
    },
  });
  if (!existsRole) {
    return errorResponse({
      req,
      next,
      message: "ROLE_NOT_FOUND",
      status: 400,
    });
  }
  const newRole = await db.updateOne({
    model: "user",
    where: {
      id: user_id,
    },
    data: {
      roleId: role_id,
    },
    include:{
      role:true
    }
  });
  return successResponse({
    res,
    req,
    status: 200,
    message: "ROLE_ASSIGNED_SUCCESS",
    data:{
      newRole
    },
  });
});

export const updateRole = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return errorResponse({ req, next, message: "MISSING_NAME", status: 400 });
  }

  const role = await db.findOne({
    model: "role",
    where: { id },
  });

  if (!role) {
    return errorResponse({
      req,
      next,
      message: "ROLE_NOT_FOUND",
      status: 404,
    });
  }

  if (name) {
    const existsRole = await db.findOne({
      model: "role",
      where: { name },
    });

    if (existsRole && existsRole.id !== id) {
      return errorResponse({
        req,
        next,
        message: "ROLE_EXISTS",
        status: 400,
      });
    }
  }

  const updatedRole = await db.updateOne({
    model: "role",
    where: { id },
    data: { name },
  });

  return successResponse({
    res,
    req,
    status: 200,
    message: "UPDATE_SUCCESS",
    data: updatedRole,
  });
});

export const deleteRole = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const role = await db.findOne({
    model: "role",
    where: { id },
  });

  if (!role) {
    return errorResponse({
      req,
      next,
      message: "ROLE_NOT_FOUND",
      status: 404,
    });
  }

  await db.deleteOne({
    model: "role",
    where: { id },
  });

  return successResponse({
    res,
    req,
    status: 200,
    message: "DELETE_SUCCESS",
  });
});
