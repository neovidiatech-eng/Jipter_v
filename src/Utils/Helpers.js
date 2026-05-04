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

export const checkExist = async ({ model, where, next }) => {
  const existing = await db.findOne({
    model,
    where,
  });

  if (!existing) {
    return errorResponse({
      next,
      status: 404,
      message: `${model} not found`,
    });
  }

  return existing;
};

export const checkConflict = async ({ model, where, next }) => {
  const existing = await db.findOne({
    model,
    where,
  });

  if (existing) {
    return errorResponse({
      next,
      status: 400,
      message: `${model} already exists`,
    });
  }

  return existing;
};

import { standardizeDate, toUTC, getDatesBetweenUTC, combineDateAndTime } from "./Date/time.js";

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

export const normalizeDate = (date) => {
  return standardizeDate(date);
};

export { getDatesBetweenUTC, combineDateAndTime };
