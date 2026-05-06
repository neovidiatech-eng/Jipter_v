import Joi from "joi";
import { generalFields } from "../../../Utils/GeneralFields/index.js";

export const updateProfileSchema = {
  body: Joi.object()
    .keys({
      name: generalFields.name,
      email: generalFields.email,
      age: generalFields.number.min(6).max(99),
    })
    .min(1),
};
