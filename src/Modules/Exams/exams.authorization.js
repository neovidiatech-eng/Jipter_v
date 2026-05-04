export const endpoints = {
  createExam: ["teacher", "admin", "super_admin"],
  updateExam: ["teacher", "admin", "super_admin"],
  deleteExam: ["teacher", "admin", "super_admin"],
  getExam: ["teacher", "admin", "super_admin", "student"],
  getStudentExam: ["student","teacher", "admin", "super_admin"],
  getAllExams: [ "admin", "super_admin"],
};
