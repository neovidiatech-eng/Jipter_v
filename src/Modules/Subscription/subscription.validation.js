import Joi from "joi";
import { generalFields } from "../../Utils/GeneralFields/index.js";

export const renewSubscription = {
  body: Joi.object({
    planId: generalFields.id.required(),
    rankId: generalFields.id.required(),
    courseId: generalFields.id.required(),
  }).required(),
  params: Joi.object({
    studentId: generalFields.id.required(),
  }).required(),
};
