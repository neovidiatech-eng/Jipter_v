import { PERMISSIONS } from "../../../Utils/Permissions/permissions.js";

export const endpoints = {
  getAllPermissions: [PERMISSIONS.PERMISSION_READ],
  createPermission: [PERMISSIONS.PERMISSION_CREATE],
  updatePermission: [PERMISSIONS.PERMISSION_UPDATE],
  deletePermission: [PERMISSIONS.PERMISSION_DELETE],
};
