import { asyncHandler, successResponse, errorResponse } from "../../../Utils/Response.js";
import * as db from "../../../database/dbService.js";
import { ensureExists } from "../../../database/genericService.js";
import { hash, decryptText, encryptText } from "../../../Utils/Security/index.js";

export const getAllStuff = asyncHandler(async (req, res, next) => {
  const { search, page = 1, limit = 10 } = req.query;

  const where = {};
  if (search) {
    where.user = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const { items: stuff, pagination } = await db.findManyWithPaginationAndCount({
    model: "stuff",
    where,
    page,
    limit,
    include: {
      user: true,
      role: true,
    },
  });

  for (const s of stuff) {
    if (s.user && s.user.phone) {
      s.user.phone = await decryptText({ text: s.user.phone });
    }
    if (s.user && s.user.password) {
      s.user.password = await decryptText({ text: s.user.password });
    }
  }

  return successResponse({
    res,
    req,
    message: "FETCH_SUCCESS",
    data: { stuff, pagination },
  });
});

export const getStuffById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Single query with nested includes for permissions
  const stuff = await ensureExists({
    model: "stuff",
    where: { id },
    include: {
      user: true,
      role: {
        include: {
          rolePermissions: {
            include: { permission: true }
          }
        }
      },
    },
    message: "USER_NOT_FOUND"
  });

  if (stuff.user && stuff.user.phone) {
    stuff.user.phone = await decryptText({ text: stuff.user.phone });
  }
  if (stuff.user && stuff.user.password) {
    stuff.user.password = await decryptText({ text: stuff.user.password });
  }

  const permissions = stuff.role?.rolePermissions.map(rp => rp.permission) || [];

  return successResponse({
    res,
    req,
    message: "FETCH_SUCCESS",
    data: {
      stuff,
      permissions,
    },
  });
});

export const createStuffUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, codeCountry, roleId } = req.body;

  const [checkUserByEmail, checkRole] = await Promise.all([
    db.findOne({ model: "user", where: { email } }),
    roleId ? db.findOne({ model: "role", where: { id: roleId } }) : Promise.resolve(null)
  ]);

  if (checkUserByEmail) return errorResponse({ req, next, message: "EMAIL_EXISTS", status: 400 });
  if (roleId && !checkRole) return errorResponse({ req, next, message: "ROLE_NOT_FOUND", status: 404 });

  const hashedPassword = encryptText({ text: password });

  const result = await db.transaction([
    db.create({
      model: "user",
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone ? encryptText({ text: phone }) : undefined,
        code_country: codeCountry,
        roleId: roleId || null,
        status: "active",
        confirmAt: new Date(),
      },
    }),
  ]);

  const user = result[0];

  const newStuff = await db.create({
    model: "stuff",
    data: {
      user: { connect: { id: user.id } },
      role: roleId ? { connect: { id: roleId } } : undefined,
    },
    include: { user: true, role: true }
  });

  if (newStuff.user && newStuff.user.phone) {
    newStuff.user.phone = await decryptText({ text: newStuff.user.phone });
  }
  if (newStuff.user && newStuff.user.password) {
    newStuff.user.password = await decryptText({ text: newStuff.user.password });
  }

  return successResponse({
    res,
    req,
    message: "CREATE_SUCCESS",
    status: 201,
    data: newStuff,
  });
});

export const updateStuffUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, password, phone, code_country, roleId } = req.body;

  const stuff = await ensureExists({ model: "stuff", where: { id }, include: { user: true } });

  if (email && email !== stuff.user.email) {
    const existing = await db.findOne({ model: "user", where: { email } });
    if (existing) return errorResponse({ req, next, message: "EMAIL_EXISTS", status: 400 });
  }

  if (password && req.user.role.name !== "super_admin") {
    return errorResponse({
      req,
      next,
      message: "ONLY_SUPER_ADMIN_CAN_CHANGE_STAFF_PASSWORD",
      status: 403,
    });
  }

  let hashedPassword;
  if (password) {
    hashedPassword = encryptText({ text: password });
  }

  // Update user data
  if (name || email || hashedPassword || phone || code_country || roleId !== undefined) {
    await db.updateOne({
      model: "user",
      where: { id: stuff.user_id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(hashedPassword && { password: hashedPassword }),
        ...(phone && { phone: encryptText({ text: phone }) }),
        ...(code_country && { code_country }),
        ...(roleId !== undefined && { roleId }),
      },
    });
  }

  const updatedStuff = await db.updateOne({
    model: "stuff",
    where: { id },
    data: {
      ...(roleId !== undefined && { role: roleId ? { connect: { id: roleId } } : { disconnect: true } }),
    },
    include: {
      user: true,
      role: true,
    },
  });

  if (updatedStuff.user && updatedStuff.user.phone) {
    updatedStuff.user.phone = await decryptText({ text: updatedStuff.user.phone });
  }
  if (updatedStuff.user && updatedStuff.user.password) {
    updatedStuff.user.password = await decryptText({ text: updatedStuff.user.password });
  }

  return successResponse({
    res,
    req,
    message: "UPDATE_SUCCESS",
    data: updatedStuff,
  });
});

export const deleteStuffUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const stuff = await ensureExists({ model: "stuff", where: { id } });

  // Delete user (cascades to stuff)
  await db.deleteOne({ model: "user", where: { id: stuff.user_id } });

  return successResponse({
    res,
    req,
    message: "DELETE_SUCCESS",
  });
});
