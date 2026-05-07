import Joi from "joi";
import { generalFields } from "../../Utils/GeneralFields/index.js";

export const registeritonSchema = {
  body: Joi.object()
    .keys({
      name: generalFields.name.required(),
      email: generalFields.email.required(),
      password: generalFields.password.required(),
      codeCountry: generalFields.codeCountry.required(),
      birth_date: generalFields.birth_date.required(),
      gender: generalFields.gender.required(),
      country: generalFields.country.required(),
      phone: Joi.when("codeCountry", {
        is: "+20",
        then: Joi.string()
          .pattern(/^(?:\+20|0020|0)?1[0125][0-9]{8}$/)
          .required()
          .messages({
            "string.pattern.base": "VALID_EGYPTIAN_PHONE",
          }),
        otherwise: Joi.when("codeCountry", {
          is: "+966",
          then: Joi.string()
            .pattern(/^(?:\+966|0)?5[0-9]{8}$/)
            .required()
            .messages({
              "string.pattern.base": "VALID_SAUDI_PHONE",
            }),
          otherwise: Joi.string().required().messages({
            "string.pattern.base": "VALID_PHONE",
          }),
        }),
      }),
      timezone: generalFields.timezone,
      plan_id: generalFields.id
        .messages({
          "string.pattern.base": "VALID_PLAN_ID",
          "any.required": "PLAN_ID_REQUIRED",
          "string.empty": "PLAN_ID_REQUIRED",
        })
        .required(),
    })
    .required(),
};
export const loginSchema = {
  body: Joi.object()
    .keys({
      username: Joi.string().required(),
      password: generalFields.password.required(),
    })
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
