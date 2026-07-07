import Joi from "joi";
import { generalFields } from "../../Utils/GeneralFields/index.js";
import { notificationType } from "../../Utils/Enums/sessions.js";
import dayjs from "dayjs";

export const createSchedule = {
  body: Joi.object()
    .keys({
      studentId: generalFields.id
        .messages({
          "string.empty": "STUDENT_ID_REQUIRED",
          "any.required": "STUDENT_ID_REQUIRED",
          "string.pattern.base": "STUDENT_ID_INVALID",
        })
        .required(),
      platform: generalFields.platform.required(),
      teacherId: generalFields.id
        .messages({
          "string.empty": "TEACHER_ID_REQUIRED",
          "any.required": "TEACHER_ID_REQUIRED",
          "string.pattern.base": "TEACHER_ID_INVALID",
        })
        .required(),
      courseId: generalFields.id
        .messages({
          "string.empty": "COURSE_ID_REQUIRED",
          "any.required": "COURSE_ID_REQUIRED",
          "string.pattern.base": "COURSE_ID_INVALID",
        })
        .required(),
      title: generalFields.name
        .messages({
          "string.empty": "TITLE_REQUIRED",
          "any.required": "TITLE_REQUIRED",
          "string.pattern.base": "TITLE_INVALID",
        })
        .required(),
      description: Joi.string().max(1000).allow("", null).messages({
        "string.pattern.base": "DESCRIPTION_INVALID",
      }),
      link: generalFields.url
        .messages({
          "string.empty": "LINK_REQUIRED",
          "any.required": "LINK_REQUIRED",
          "string.pattern.base": "LINK_INVALID",
        })
        .required(),
      notes: Joi.string().max(1000).allow("", null).messages({
        "string.pattern.base": "NOTES_INVALID",
      }),

      start_time: generalFields.date.greater("now")
        .messages({
          "string.empty": "START_TIME_REQUIRED",
          "any.required": "START_TIME_REQUIRED",
          "string.pattern.base": "START_TIME_INVALID",
        })
        .custom((value) => {
          if (dayjs(value).isBefore(dayjs())) {
            return dayjs(value).isAfter(dayjs().subtract(1, "day"));
          }
          return value;
        })
        .required(),
      type: generalFields.type.required(),
      language: Joi.string().valid("en", "ar", "fr").default("en"),
      videoUrl: Joi.string().uri().allow(null, ""),
      slidesUrl: Joi.string().uri().allow(null, ""),
      notification_Time: Joi.string()
        .valid(...Object.values(notificationType))
        .required()
        .messages({
          "string.empty": "NOTIFICATION_TIME_REQUIRED",
          "any.required": "NOTIFICATION_TIME_REQUIRED",
          "string.pattern.base": "NOTIFICATION_TIME_INVALID",
        }),
    })
    .required(),
};

export const createRecurringSchedule = {
  body: Joi.object()
    .keys({
      studentId: generalFields.id.required(),
      teacherId: generalFields.id.required(),
      courseId: generalFields.id.required(),
      title: generalFields.name,
      description: Joi.string().max(1000).allow("", null),
      link: generalFields.url.required(),
      notes: Joi.string().max(1000).allow("", null),
      startTime: Joi.string()
        .regex(/^([01]\d|2[0-3]):?([0-5]\d)$/)
        .required()
        .messages({
          "string.pattern.base": "START_TIME_FORMAT",
        }).custom((value) => {
          if (dayjs(value).isBefore(dayjs())) {
            return dayjs(value).isAfter(dayjs().subtract(1, "day"));
          }
          return value;
        }),
      days: Joi.array()
        .items(
          Joi.string().valid(
            "Saturday",
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
          ),
        )
        .min(1)
        .required(),
      startDate: generalFields.date
        .messages({
          "string.empty": "START_TIME_REQUIRED",
          "any.required": "START_TIME_REQUIRED",
          "string.pattern.base": "START_TIME_INVALID",
        })
        .custom((value) => {
          if (dayjs(value).isBefore(dayjs())) {
            return dayjs(value).isAfter(dayjs().subtract(1, "day"));
          }
          return value;
        })
        .required(),
      endDate: Joi.date().iso().min(Joi.ref("startDate")).required(),
      notification_Time: Joi.string()
        .valid(...Object.values(notificationType))
        .required(),
      language: Joi.string().valid("en", "ar", "fr").default("en"),
      videoUrl: Joi.string().uri().allow(null, ""),
    })
    .required(),
};

export const updateSchedule = {
  body: Joi.object()
    .keys({
      title: generalFields.name,
      description: Joi.string().max(1000).allow("", null),
      link: generalFields.url,
      notes: Joi.string().max(1000).allow("", null),
      status: Joi.string().valid("planned", "completed", "missed", "cancelled"),
      start_time: Joi.date().greater("now"),
      type: generalFields.type,
      language: Joi.string().valid("en", "ar", "fr"),
      videoUrl: Joi.string().uri().allow(null, ""),
      slidesUrl: Joi.string().uri().allow(null, ""),
      notification_Time: Joi.string().valid(...Object.values(notificationType)),
      instractor:generalFields.id.optional().messages({
        "string.empty": "INSTRACTOR_ID_REQUIRED",
        "any.required": "INSTRACTOR_ID_REQUIRED",
        "string.pattern.base": "INSTRACTOR_ID_INVALID",
      })
    })
    .min(1)
    .required(),
  params: Joi.object()
    .keys({
      id: generalFields.id.required(),
    })
    .required(),
};

export const updateRecurringGroup = {
  body: Joi.object()
    .keys({
      title: generalFields.name,
      description: Joi.string().max(1000).allow("", null),
      link: generalFields.url,
      notes: Joi.string().max(1000).allow("", null),
      status: Joi.string().valid("planned", "completed", "missed", "cancelled"),
      startTime: Joi.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/),
      type: generalFields.type,
      notification_Time: Joi.string().valid(...Object.values(notificationType)),
    })
    .min(1)
    .required(),
  params: Joi.object()
    .keys({
      parent_recurring_id: generalFields.parent_recurring_id.required(),
    })
    .required(),
};

export const getTeacherSchedules = {
  params: Joi.object()
    .keys({
      teacherId: generalFields.id
        .messages({
          "string.empty": "TEACHER_ID_REQUIRED",
          "any.required": "TEACHER_ID_REQUIRED",
          "string.pattern.base": "TEACHER_ID_INVALID",
        })
        .required(),
    })
    .required(),
};
export const getStudentSchedules = {
  params: Joi.object()
    .keys({
      studentId: generalFields.id.messages({
        "string.empty": "STUDENT_ID_REQUIRED",
        "any.required": "STUDENT_ID_REQUIRED",
        "string.pattern.base": "STUDENT_ID_INVALID",
      }),
    })
    .required(),
};

export const deleteSchedule = {
  params: Joi.object().keys({
    id: generalFields.id.required(),
  }),
};
export const changeInstructor = {
  params: Joi.object().keys({
    id: generalFields.id.required(),
  }),
  body: Joi.object().keys({
    teacherId: generalFields.id.required(),
  }),
};
export const deleteRecurringGroup = {
  params: Joi.object().keys({
    parent_recurring_id: generalFields.parent_recurring_id.required(),
  }),
};

export const submitReview = {
  body: Joi.object()
    .keys({
      rating: Joi.number().min(1).max(5).required(),
      comment: generalFields.description.required(),
      teacherAttended: Joi.boolean().required(),
      studentAttended: Joi.boolean().required(),
    })
    .required(),
  params: Joi.object()
    .keys({
      id: generalFields.id.required(),
    })
    .required(),
};

export const joinSession = {
  params: Joi.object()
    .keys({
      id: generalFields.id
        .messages({
          "string.empty": "ID_REQUIRED",
          "any.required": "ID_REQUIRED",
          "string.pattern.base": "ID_INVALID",
        })
        .required(),
    })
    .required(),
};

export const leaveSession = {
  params: Joi.object()
    .keys({
      id: generalFields.id
        .messages({
          "string.empty": "ID_REQUIRED",
          "any.required": "ID_REQUIRED",
          "string.pattern.base": "ID_INVALID",
        })
        .required(),
    })
    .required(),
};
