import { PERMISSIONS } from "../../Utils/Permissions/permissions.js";

export const endpoints = {
  createStudent: [PERMISSIONS.STUDENT_CREATE],
  getStudent: [PERMISSIONS.STUDENT_READ],
  updateStudent: [PERMISSIONS.STUDENT_UPDATE],
  deleteStudent: [PERMISSIONS.STUDENT_DELETE],
};
