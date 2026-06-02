import Joi from "joi";
import { generalFields } from "../../Utils/GeneralFields/index.js";

export const createStudentSchema = {
  body: Joi.object().keys({
    name: generalFields.name.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    phone: generalFields.phone.required(),
    phone_code: generalFields.codeCountry.required(),
    country: generalFields.country.required(),
    planId: generalFields.id
      .messages({
        "string.base": "PLAN_ID_MUST_BE_STRING",
        "string.empty": "PLAN_ID_CANNOT_BE_EMPTY",
        "string.pattern.base": "PLAN_ID_MUST_BE_VALID_ID",
        "any.required": "PLAN_ID_REQUIRED",
      })
      .required(),
    age: generalFields.studentAge,
    birth_date: generalFields.birth_date,
    gender: generalFields.gender.required(),
    active: generalFields.active.required(),
    rankId: generalFields.id,
    timezone: generalFields.timezone, // optional — fallback to default
  })
    .or("age", "birth_date")
    .messages({ "object.missing": "AGE_OR_BIRTH_DATE_REQUIRED" }),
};

export const updateStudentSchema = {
  params: Joi.object().keys({
    id: generalFields.id.required(),
  }),
  body: Joi.object()
    .keys({
      name: generalFields.name,
      username: Joi.string().min(3).max(64),
      password: generalFields.password,
      phone: generalFields.phone,
      phone_code: generalFields.codeCountry,
      country: generalFields.country,
      planId: generalFields.id,
      birth_date: generalFields.birth_date,
      age: generalFields.studentAge,
      gender: generalFields.gender,
      active: generalFields.active,
      rankId: generalFields.id,
      timezone: generalFields.timezone,
    })
    .min(1)
    .messages({ "object.min": "VALIDATION_MIN_ONE_FIELD" }),
};

export const studentIdSchema = {
  params: Joi.object().keys({
    id: generalFields.id.required(),
  }),
};
