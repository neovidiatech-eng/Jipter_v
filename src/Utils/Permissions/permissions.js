/**
 * Central Permission Codes Registry
 * All permission codes used across the application are defined here.
 * Format: <resource>.<action>
 *
 * These codes must match the `code` field in the `permission` table.
 */
export const PERMISSIONS = {
  // ─── Student Dashboard ────────────────────────────────────────────────────
  STUDENT_DASHBOARD_READ: "student.dashboard.read",
  STUDENT_PROFILE_READ: "student.profile.read",
  STUDENT_PROFILE_UPDATE: "student.profile.update",

  // ─── Teacher Dashboard ────────────────────────────────────────────────────
  TEACHER_PROFILE_READ: "teacher.profile.read",
  TEACHER_TRANSACTIONS_READ: "teacher.transactions.read",
  TEACHER_MY_STUDENTS_READ: "teacher.my_students.read",

  // ─── Homework ─────────────────────────────────────────────────────────────
  HOMEWORK_CREATE: "homework.create",
  HOMEWORK_UPDATE: "homework.update",
  HOMEWORK_DELETE: "homework.delete",
  HOMEWORK_READ: "homework.read",

  // ─── Exams ────────────────────────────────────────────────────────────────
  EXAM_CREATE: "exam.create",
  EXAM_UPDATE: "exam.update",
  EXAM_DELETE: "exam.delete",
  EXAM_READ: "exam.read",
  EXAM_ALL_READ: "exam.all.read",

  // ─── Requests ─────────────────────────────────────────────────────────────
  REQUEST_CREATE: "request.create",
  REQUEST_HANDLE: "request.handle",
  REQUEST_ALL_READ: "request.all.read",
  REQUEST_OWN_READ: "request.own.read",

  // ─── Student Management (Admin) ───────────────────────────────────────────
  STUDENT_CREATE: "student.create",
  STUDENT_READ: "student.read",
  STUDENT_UPDATE: "student.update",
  STUDENT_DELETE: "student.delete",

  // ─── Teacher Management ───────────────────────────────────────────────────
  TEACHER_ALL_READ: "teacher.all.read",

  // ─── System – Roles ───────────────────────────────────────────────────────
  ROLE_READ: "role.read",
  ROLE_CREATE: "role.create",
  ROLE_UPDATE: "role.update",
  ROLE_DELETE: "role.delete",
  ROLE_ASSIGN: "role.assign",

  // ─── System – Permissions ─────────────────────────────────────────────────
  PERMISSION_READ: "permission.read",
  PERMISSION_CREATE: "permission.create",
  PERMISSION_UPDATE: "permission.update",
  PERMISSION_DELETE: "permission.delete",

  // ─── System – Staff ───────────────────────────────────────────────────────
  STAFF_READ: "staff.read",
  STAFF_CREATE: "staff.create",
  STAFF_UPDATE: "staff.update",
  STAFF_DELETE: "staff.delete",

  // ─── Support ──────────────────────────────────────────────────────────────
  SUPPORT_READ: "support.read",
  SUPPORT_MANAGE: "support.manage",

  // ─── Subscription ─────────────────────────────────────────────────────────
  SUBSCRIPTION_MANAGE: "subscription.manage",

  // ─── Settings ─────────────────────────────────────────────────────────────
  SETTINGS_UPDATE: "settings.update",

  // ─── Materials ────────────────────────────────────────────────────────────
  COURSE_MANAGE: "course.manage",
  LECTURE_MANAGE: "lecture.manage",
  LECTURE_READ: "lecture.read",
  RANK_READ: "rank.read",
  RANK_CREATE: "rank.create",
  RANK_UPDATE: "rank.update",
  RANK_DELETE: "rank.delete",

  // ─── Policies ─────────────────────────────────────────────────────────────
  POLICY_MANAGE: "policy.manage",

  // ─── Transactions ─────────────────────────────────────────────────────────
  TRANSACTION_READ: "transaction.read",

  // ─── Withdrawals ──────────────────────────────────────────────────────────
  WITHDRAWAL_READ: "withdrawal.read",
  WITHDRAWAL_CREATE: "withdrawal.create",
  WITHDRAWAL_APPROVE: "withdrawal.approve",

  // ─── Weekly Reports ───────────────────────────────────────────────────────
  WEEKLY_REPORT_CREATE: "weekly_report.create",
  WEEKLY_REPORT_UPDATE: "weekly_report.update",
  WEEKLY_REPORT_DELETE: "weekly_report.delete",
  WEEKLY_REPORT_READ: "weekly_report.read",
  WEEKLY_REPORT_ALL_READ: "weekly_report.all.read",

  // ─── Calendar ─────────────────────────────────────────────────────────────
  CALENDAR_READ: "calendar.read",
};

/**
 * Roles that bypass permission checks.
 */
export const ADMIN_ROLES = ["admin", "super_admin"];

/**
 * Checks if a user has an administrative role.
 *
 * @param {Object} user - The user object.
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  return ADMIN_ROLES.includes(user?.role?.name);
};

/**
 * Helper to extract permission codes from a user object.
 * Assumes the user object has the role and rolePermissions populated.
 *
 * @param {Object} user - The user object from the database.
 * @returns {Set<string>} - A Set of permission codes.
 */
export const getUserPermissions = (user) => {
  if (!user?.role?.rolePermissions) return new Set();
  return new Set(
    user.role.rolePermissions.map((rp) => rp.permission?.code).filter(Boolean),
  );
};

/**
 * Checks if a user has a specific permission.
 *
 * @param {Object} user - The user object.
 * @param {string} permissionCode - The permission code to check.
 * @returns {boolean}
 */
export const hasPermission = (user, permissionCode) => {
  if (isAdmin(user)) return true;
  const permissions = getUserPermissions(user);
  return permissions.has(permissionCode);
};

/**
 * Checks if a user has at least one of the required permissions.
 *
 * @param {Object} user - The user object.
 * @param {string[]} permissionCodes - Array of permission codes.
 * @returns {boolean}
 */
export const hasAnyPermission = (user, permissionCodes) => {
  const codes = Array.isArray(permissionCodes)
    ? permissionCodes
    : [permissionCodes];
  if (!codes || codes.length === 0 || (codes.length === 1 && !codes[0]))
    return true;
  const userPermissions = getUserPermissions(user);

  return codes.some((code) => userPermissions.has(code));
};

/**
 * Checks if a user has all of the required permissions.
 *
 * @param {Object} user - The user object.
 * @param {string[]} permissionCodes - Array of permission codes.
 * @returns {boolean}
 */
export const hasAllPermissions = (user, permissionCodes) => {
  const codes = Array.isArray(permissionCodes)
    ? permissionCodes
    : [permissionCodes];
  if (!codes || codes.length === 0 || (codes.length === 1 && !codes[0]))
    return true;
  const userPermissions = getUserPermissions(user);
  return codes.every((code) => userPermissions.has(code));
};
