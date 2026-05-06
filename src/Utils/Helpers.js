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

import {
  standardizeDate,
  toUTC,
  getDatesBetweenUTC,
  combineDateAndTime,
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

export const normalizeDate = (date) => {
  return standardizeDate(date);
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

  return error;
};
