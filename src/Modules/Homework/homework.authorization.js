export const endpoints = {
  createHomework: ["teacher", "admin", "super_admin"],
  updateHomework: ["teacher", "admin", "super_admin"],
  deleteHomework: ["teacher", "admin", "super_admin"],
  getHomework: ["teacher", "admin", "super_admin", "student"],
  getStudentHomework: ["student"],
};
