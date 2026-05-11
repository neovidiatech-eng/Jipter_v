import { PERMISSIONS } from "../../../Utils/Permissions/permissions.js";

export const endpoints = {
  create: [PERMISSIONS.TEACHER_SUBJECTS_CREATE],
  update: [PERMISSIONS.TEACHER_SUBJECTS_UPDATE],
  delete: [PERMISSIONS.TEACHER_SUBJECTS_DELETE],
};