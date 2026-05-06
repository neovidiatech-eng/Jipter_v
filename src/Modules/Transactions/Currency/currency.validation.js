import Joi from "joi";
import { generalFields } from "../../../Utils/GeneralFields/index.js";

export const getCurrenciesSchema = {
  query: Joi.object()
    .keys({
      search: generalFields.search_Currency.optional(),
    })
    .required(),
};
export const getCurrencyById = {
  query: Joi.object()
    .keys({
      search: generalFields.search_Currency.optional(),
    })
    .required(),
};

export const addCurrencySchema = {
  body: Joi.object()
    .keys({
      name_en: generalFields.name_en.required(),
      name_ar: generalFields.name_ar.required(),
      symbol: generalFields.symbol.required(),
      code: generalFields.code.required(),
      exchangeRate: generalFields.exchangeRate.required(),
    })
    .required(),
};

export const updateCurrencySchema = {
  body: Joi.object()
    .keys({
      name_en: generalFields.name_en.optional(),
      name_ar: generalFields.name_ar.optional(),
      symbol: generalFields.symbol.optional(),
      code: generalFields.code.optional(),
      exchangeRate: generalFields.exchangeRate.optional(),
      default: generalFields.default.optional(),
    })
    .required(),
  params: Joi.object()
    .keys({
      id: Joi.string().uuid().required(),
    })
    .required(),
};
export const deleteCurrencySchema = {
  params: Joi.object()
    .keys({
      id: Joi.string().uuid().required(),
    })
    .required(),
};
