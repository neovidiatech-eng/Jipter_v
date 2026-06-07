import Joi from "joi";
import { generalFields } from "../../Utils/GeneralFields/index.js";

export const createRequest = {
  body: Joi.object({
    sessionId: generalFields.id.optional(),
    type: Joi.string()
      .valid(
        "reschedule",
        "cancel",
        "absence_correction",
        "new_session",
        "vacation",
        "sick_leave",
        "excuse",
        "emergency",
        "resign",
        "technical_issue",
      )
      .required(),
    priority: Joi.string().valid("low", "medium", "high").default("medium"),
    title: Joi.string().optional(),
    reason: Joi.string().min(5).max(500).required(),
    requestedData: Joi.object({
      new_start_time: generalFields.date.optional(),
      new_end_time: generalFields.date.optional(),
      new_status: Joi.string().valid("completed", "missed").optional(),
      suggested_notes: Joi.string().optional(),
      // Fields for new_session if no initial sessionId
      studentId: generalFields.id.optional(),
      teacherId: generalFields.id.optional(),
      courseId: generalFields.id.optional(),
      title: Joi.string().optional(),
    }).optional(),
  }).required(),
};

export const handleRequest = {
  params: Joi.object({
    id: generalFields.id.required(),
  }).required(),
  body: Joi.object({
    adminNotes: Joi.string().max(500).optional(),
  }).required(),
};
