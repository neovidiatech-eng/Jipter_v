import { PERMISSIONS } from "../../Utils/Permissions/permissions.js";

export const endpoints = {
  createRequest: [PERMISSIONS.REQUEST_CREATE],
  handleRequest: [PERMISSIONS.REQUEST_HANDLE],
  getAllRequests: [PERMISSIONS.REQUEST_ALL_READ],
  getMyRequests: [PERMISSIONS.REQUEST_OWN_READ],
};
