import { PERMISSIONS } from "../../Utils/Permissions/permissions.js";

export const endpoints = {
  createExam: [PERMISSIONS.EXAM_CREATE],
  updateExam: [PERMISSIONS.EXAM_UPDATE],
  deleteExam: [PERMISSIONS.EXAM_DELETE],
  getExam: [PERMISSIONS.EXAM_READ],
  getStudentExam: [PERMISSIONS.EXAM_READ],
  getAllExams: [PERMISSIONS.EXAM_ALL_READ],
};
