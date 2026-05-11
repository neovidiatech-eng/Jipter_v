import { PERMISSIONS } from "../../Utils/Permissions/permissions.js";

export const endpoints = {
  createHomework: [PERMISSIONS.HOMEWORK_CREATE],
  updateHomework: [PERMISSIONS.HOMEWORK_UPDATE],
  deleteHomework: [PERMISSIONS.HOMEWORK_DELETE],
  getHomework: [PERMISSIONS.HOMEWORK_READ],
};
