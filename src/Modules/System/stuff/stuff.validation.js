import Joi from "joi";
import { generalFields } from "../../../Utils/GeneralFields/index.js";

export const createStuffUserSchema = {
  body: Joi.object({
    name: generalFields.name.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    phone: generalFields.phone.required(),
    code_country: generalFields.codeCountry.required(),
    roleId: generalFields.id.required(),
  }),
};

export const updateStuffUserSchema = {
  params: Joi.object({
    id: generalFields.id.required(),
  }),
  body: Joi.object({
    name: generalFields.name,
    email: generalFields.email,
    password: generalFields.password,
    phone: generalFields.phone,
    code_country: generalFields.codeCountry,
    roleId: generalFields.id,
  }),
};

export const deleteStuffUserSchema = {
  params: Joi.object({
    id: generalFields.id.required(),
  }),
};

export const getStuffByIdSchema = {
  params: Joi.object({
    id: generalFields.id.required(),
  }),
};

export const getAllStuffSchema = {
  query: Joi.object({
    search: Joi.string(),
  }),
};
