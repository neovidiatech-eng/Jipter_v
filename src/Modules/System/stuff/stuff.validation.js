import Joi from "joi";
import { generalFeilds } from "../../../Middlewares/Validation.js";

export const createStuffUserSchema = {
  body: Joi.object({
    name: generalFeilds.name.required(),
    email: generalFeilds.email.required(),
    password: generalFeilds.password.required(),
    phone: generalFeilds.phone.required(),
    code_country: generalFeilds.codeCountry.required(),
    roleId: generalFeilds.id.required(),
  }),
};

export const updateStuffUserSchema = {
  body: Joi.object({
    name: generalFeilds.name.required(),
    phone: generalFeilds.phone.required(),
    code_country: generalFeilds.codeCountry.required(),
    roleId: generalFeilds.id.required(),
  }),
};

export const deleteStuffUserSchema = {
  params: Joi.object({
    id: generalFeilds.id.required(),
  }),
};

export const getStuffByIdSchema = {
  params: Joi.object({
    id: generalFeilds.id.required(),
  }),
};

export const getAllStuffSchema = {
  query: Joi.object({
    search: Joi.string(),
  }),
};
