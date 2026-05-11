import { PERMISSIONS } from "../../Utils/Permissions/permissions.js";

export const endpoints = {
  getAllRoles: [PERMISSIONS.ROLE_READ],
  createRoles: [PERMISSIONS.ROLE_CREATE],
  updateRole: [PERMISSIONS.ROLE_UPDATE],
  deleteRole: [PERMISSIONS.ROLE_DELETE],
  assignRole: [PERMISSIONS.ROLE_ASSIGN],
};
