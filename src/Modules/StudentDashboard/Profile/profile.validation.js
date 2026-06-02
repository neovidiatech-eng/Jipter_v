import Joi from "joi";
import { generalFields } from "../../../Utils/GeneralFields/index.js";

export const updateProfileSchema = {
  body: Joi.object()
    .keys({
      name: generalFields.name,
      username: Joi.string().min(3).max(64),
      password: generalFields.password,
      phone: generalFields.phone,
      phone_code: generalFields.codeCountry,
      age: generalFields.studentAge,
      birth_date: generalFields.birth_date,
      gender: generalFields.gender,
      country: generalFields.country,
      timezone: generalFields.timezone,
    })
    .min(1),
};
