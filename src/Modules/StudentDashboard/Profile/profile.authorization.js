import { PERMISSIONS } from "../../../Utils/Permissions/permissions.js";

export const endpoints = {
  getProfile: [PERMISSIONS.STUDENT_PROFILE_READ],
  updateProfile: [PERMISSIONS.STUDENT_PROFILE_UPDATE],
};