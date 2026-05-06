import joi from "joi";
import { generalFields } from "../../Utils/GeneralFields/index.js";
export const getAllTeachersSchema = {
  query: joi.object({
    search: generalFields.search,
    /*  page: generalFields.page,
    limit: generalFields.limit,
    sort: generalFields.sort,
    sortType: generalFields.sortType, */
  }),
};

export const createTeacherSchema = {
  body: joi
    .object({
      name: generalFields.name.required(),
      email: generalFields.email.required(),
      password: generalFields.password.required(),
      phone: generalFields.phone.required(),
      code_country: generalFields.codeCountry.required(),
      currency_id: generalFields.id
        .messages({
          "string.base": "CURRENCY_ID_STRING",
          "string.empty": "CURRENCY_ID_EMPTY",
          "any.required": "CURRENCY_ID_REQUIRED",
        })
        .required(),
      gender: generalFields.gender.required(),
      hour_price: generalFields.price.required(),
      active: generalFields.active.required(),
    })
    .required(),
};

export const getTeacherSchema = {
  params: joi.object({
    id: generalFields.id.required(),
  }),
};

export const deleteTeacherSchema = {
  params: joi.object({
    id: generalFields.id.required(),
  }),
};

export const updateTeacherSchema = {
  params: joi.object({
    id: generalFields.id.required(),
  }),
  body: joi
    .object({
      name: generalFields.name,
      email: generalFields.email,
      password: generalFields.password,
      phone: generalFields.phone,
      code_country: generalFields.codeCountry,
      currency_id: generalFields.id.messages({
        "string.base": "CURRENCY_ID_STRING",
        "string.empty": "CURRENCY_ID_EMPTY",
      }),
      gender: generalFields.gender,
      hour_price: generalFields.price,
      active: generalFields.active,
      subject_ids: joi.array().items(
        generalFields.id.messages({
          "string.base": "SUBJECT_ID_STRING",
          "string.empty": "SUBJECT_ID_EMPTY",
        }),
      ),
    })
    .required(),
};
