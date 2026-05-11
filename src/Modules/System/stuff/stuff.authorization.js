import { PERMISSIONS } from "../../../Utils/Permissions/permissions.js";

export const endpoints = {
  getAllStuff: [PERMISSIONS.STAFF_READ],
  getStuffById: [PERMISSIONS.STAFF_READ],
  createStuffUser: [PERMISSIONS.STAFF_CREATE],
  updateStuffUser: [PERMISSIONS.STAFF_UPDATE],
  deleteStuffUser: [PERMISSIONS.STAFF_DELETE],
};
