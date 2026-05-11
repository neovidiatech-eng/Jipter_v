import { PERMISSIONS } from "../../Utils/Permissions/permissions.js";

export const endpoints = {
  GET_ALL_TEACHERS: [PERMISSIONS.TEACHER_ALL_READ],
  GET_MY_STUDENTS: [PERMISSIONS.TEACHER_MY_STUDENTS_READ],
};