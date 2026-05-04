export const endpoints = {
  createRequest: ["teacher", "student"], // Only these can request
  handleRequest: ["admin", "super_admin"], // Only admin can approve/reject
  getAllRequests: ["admin", "super_admin"],
  getMyRequests: ["teacher", "student"],
};
