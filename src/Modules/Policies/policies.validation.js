import Joi from "joi";
import { generalFields } from "../../Utils/GeneralFields/index.js";

export const createPolicySchema = {
  body: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    icon: Joi.string().allow("", null),
    color: Joi.string().allow("", null),
    lastUpdated: Joi.date(),
    active: Joi.boolean(),
  }).required(),
};

export const updatePolicySchema = {
  body: Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    icon: Joi.string().allow("", null),
    color: Joi.string().allow("", null),
    lastUpdated: Joi.date(),
    active: Joi.boolean(),
  }).required(),
  params: Joi.object({
    id: generalFields.id.required(),
  }).required(),
};

export const policyIdSchema = {
  params: Joi.object({
    id: generalFields.id.required(),
  }).required(),
};

export const createNoticeSchema = {
  body: Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    active: Joi.boolean(),
  }).required(),
};

export const updateNoticeSchema = {
  body: Joi.object({
    title: Joi.string(),
    content: Joi.string(),
    active: Joi.boolean(),
  }).required(),
  params: Joi.object({
    id: generalFields.id.required(),
  }).required(),
};
