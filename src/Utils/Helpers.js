import * as db from "../database/dbService.js";
import { errorResponse } from "./Response.js";

export const destructData = ({ body, allowed }) => {
  return Object.keys(body).reduce((acc, key) => {
    if (allowed.includes(key)) {
      acc[key] = body[key];
    }
    return acc;
  }, {});
};

export const checkExist = async ({ model, where, next, include }) => {
  const existing = await db.findOne({
    model,
    where,
    include,
  });

  if (!existing) {
    return errorResponse({
      next,
      status: 404,
      message: `${model.toUpperCase()}_NOT_FOUND`,
    });
  }

  return existing;
};

import {
  standardizeDate,
  toUTC,
  getDatesBetweenUTC,
  combineDateAndTime,
  getNowUTC,
} from "./Date/time.js";

export const getEndTime = (startTime, type, duration = 0) => {
  const start = toUTC(startTime);
  if (!start) return null;

  let end;
  if (duration > 0) {
    end = start.add(duration, "minute");
  } else if (type === "half") {
    end = start.add(30, "minute");
  } else if (type === "full") {
    end = start.add(1, "hour");
  } else {
    end = start;
  }

  return end.toDate();
};

/**
 * Normalize a date string to UTC using the provided timezone.
 * @param {string|Date} date
 * @param {string} tz - IANA timezone (e.g. "Africa/Cairo")
 * @returns {Date}
 */
export const normalizeDate = (date, tz) => {
  return standardizeDate(date, tz);
};

export { getDatesBetweenUTC, combineDateAndTime };

export const getImageUrl = (image, req) => {
  if (!image) return null;
  if (image.secure_url) return image.secure_url;

  // For local files, construct URL
  if (typeof image === "string" && image.startsWith("uploads")) {
    const protocol = req.protocol;
    const host = req.get("host");
    return `${protocol}://${host}/${image}`;
  }

  return image;
};

export const createError = ({ message, status, next }) => {
  const error = new Error(message);
  error.status = status;
  error.isMessageKey = true;

  return error;
};

/**
 * Converts an amount from one currency to another using exchange rates relative to a common base.
 * Formula: (amount / sourceRate) * targetRate
 *
 * @param {number} amount - The amount to convert.
 * @param {number} sourceRate - The exchange rate of the source currency.
 * @param {number} targetRate - The exchange rate of the target currency.
 * @returns {number} The converted amount.
 */
export const convertAmount = (amount, sourceRate, targetRate) => {
  if (!sourceRate || sourceRate === 0) return amount;
  const result = (amount / sourceRate) * targetRate;
  return Number(result.toFixed(2));
};

export const getAge = ({ birthDate }) => {
  const today = getNowUTC();
  const birth = toUTC(birthDate);

  let age = today.year() - birth.year();

  const hasNotHadBirthdayThisYear =
    today.month() < birth.month() ||
    (today.month() === birth.month() && today.date() < birth.date());

  if (hasNotHadBirthdayThisYear) {
    age--;
  }

  return age;
};

export const resolveStudentAge = ({ age, birthDate }) => {
  if (age !== undefined && age !== null && age !== "") {
    return Number(age);
  }

  if (birthDate) {
    return getAge({ birthDate });
  }

  return null;
};

export const findRankByAge = async ({ age, dbClient = db }) => {
  const numericAge = Number(age);
  if (!Number.isFinite(numericAge)) return null;

  const ranks = await dbClient.findMany({ model: "ranks" });
  return ranks
    .sort((a, b) => {
      const aMin = Number(a.ageRange?.minAge ?? 0);
      const bMin = Number(b.ageRange?.minAge ?? 0);
      const aMax = Number(a.ageRange?.maxAge ?? 0);
      const bMax = Number(b.ageRange?.maxAge ?? 0);
      return aMin - bMin || aMax - bMax;
    })
    .find((rank) => {
      const minAge = Number(rank.ageRange?.minAge);
      const maxAge = Number(rank.ageRange?.maxAge);
      return numericAge >= minAge && numericAge <= maxAge;
    });
};

/**
 * Calculates dynamic lock status for a Recorded item based on session start time.
 * Rule:
 * current time < session.startAt -> locked: true
 * current time >= session.startAt -> locked: false
 *
 * @param {Object|null} session - Schedule / Session object with start_time or startAt
 * @returns {{ locked: boolean, availableAt: string|Date|null }}
 */
export const getRecordLockStatus = (session) => {
  const startAt = session?.start_time || session?.startAt || null;
  if (!startAt) {
    return {
      locked: true,
      availableAt: null,
    };
  }
  const isLocked = new Date() < new Date(startAt);
  return {
    locked: isLocked,
    availableAt: startAt,
  };
};

/**
 * Checks if a student is on a Free Trial or 1-session plan.
 *
 * @param {Object|null} student - Student object with plan
 * @returns {boolean}
 */
export const isFreeTrialStudent = (student) => {
  if (!student) return false;
  return (
    student.sessions === 1 ||
    student.sessions_remaining === 1 ||
    student.plan?.price === "0" ||
    student.plan?.price === 0 ||
    student.plan?.name?.toLowerCase().includes("free") ||
    student.plan?.name?.toLowerCase().includes("trial") ||
    student.plan?.sessionsCount === 1
  );
};


