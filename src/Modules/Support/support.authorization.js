import { PERMISSIONS } from "../../Utils/Permissions/permissions.js";

export const endpoints = {
  getSupport: [PERMISSIONS.SUPPORT_READ],
  manageSupport: [PERMISSIONS.SUPPORT_MANAGE],
};
