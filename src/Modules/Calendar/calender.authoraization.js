import { PERMISSIONS } from "../../Utils/Permissions/permissions.js";

export const endpoints = {
  getCalendar: [PERMISSIONS.CALENDAR_READ],
  getStudentCalendar: [PERMISSIONS.CALENDAR_READ],
  getTeachersCalendar: [PERMISSIONS.CALENDAR_READ],
  getTeacherCalendar: [PERMISSIONS.CALENDAR_READ],
};