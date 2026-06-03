import Joi from "joi";
import { generalFields } from "../../Utils/GeneralFields/index.js";

export const registeritonSchema = {
  body: Joi.object()
    .keys({
      name: generalFields.name.required(),
      email: generalFields.email.required(),
      password: generalFields.password.required(),
      codeCountry: generalFields.codeCountry.required(),
      age: generalFields.studentAge,
      birth_date: generalFields.birth_date,
      gender: generalFields.gender.required(),
      country: generalFields.country.required(),
      phone: generalFields.phone.required(),
      timezone: generalFields.timezone,
      plan_id: generalFields.id
        .messages({
          "string.pattern.base": "VALID_PLAN_ID",
          "any.required": "PLAN_ID_REQUIRED",
          "string.empty": "PLAN_ID_REQUIRED",
        })
        .required(),
    })
    .or("age", "birth_date")
    .messages({ "object.missing": "AGE_OR_BIRTH_DATE_REQUIRED" })
    .required(),
};
export const loginSchema = {
  body: Joi.object()
    .keys({
      email: generalFields.email,
      username: Joi.string(),
      password: generalFields.password.required(),
    })
    .or("email", "username")
    .messages({ "object.missing": "MISSING_CREDENTIALS" })
    .required(),
};
export const googleSignupSchema = {
  body: Joi.object()
    .keys({
      idToken: generalFields.idToken.required(),
    })
    .required(),
};
export const googleLoginSchema = {
  body: Joi.object()
    .keys({
      idToken: generalFields.idToken.required(),
      provider: generalFields.provider.required(),
    })
    .required(),
};
export const verifiyCodeSchema = {
  body: Joi.object()
    .keys({
      email: generalFields.email.required(),
      otp: generalFields.otp.required(),
    })
    .required(),
};
export const forgetPasswordSchema = {
  body: Joi.object()
    .keys({
      email: generalFields.email.required(),
    })
    .required(),
};
export const resendOtpSchema = {
  body: Joi.object()
    .keys({
      email: generalFields.email.required(),
    })
    .required(),
};
export const resetPasswordSchema = {
  body: Joi.object()
    .keys({
      email: generalFields.email.required(),
      otp: generalFields.otp.required(),
      password: generalFields.password.required(),
      confirm: generalFields.confirmPassword.required(),
    })
    .required(),
};
