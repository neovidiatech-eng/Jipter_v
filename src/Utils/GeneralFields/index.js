import Joi from "joi";
import { VALID_TIMEZONE_VALUES } from "../Date/timezones.js";

const globalPhonePattern = /^(?:\+[1-9]\d{5,14}|0?\d{5,14})$/;
const countryCallingCodePattern = /^\+[1-9]\d{0,3}$/;

export const generalFields = {
  role_name: Joi.string().min(3).max(15).messages({
    "string.base": "Role name must be a string",
    "string.empty": "Role name cannot be empty",
    "string.min": "Role name must be at least {#limit} characters",
    "string.max": "Role name must be at most {#limit} characters",
    "any.required": "Role name is required",
  }),
  timezone: Joi.string()
    .valid(...VALID_TIMEZONE_VALUES)
    .messages({
      "string.base": "Timezone must be a string",
      "string.empty": "Timezone cannot be empty",
      "any.only": "Timezone must be a valid IANA timezone",
      "any.required": "Timezone is required",
    }),
  url: Joi.string().uri(),
  platform: Joi.string().valid("zoom", "google").messages({
    "string.base": "Platform must be a string",
    "string.empty": "Platform cannot be empty",
    "any.only": "Platform must be either 'zoom' or 'google'",
    "any.required": "Platform is required",
  }),
  permission_name: Joi.string().min(3).max(32).messages({
    "string.base": "Permission name must be a string",
    "string.empty": "Permission name cannot be empty",
    "string.min": "Permission name must be at least {#limit} characters",
    "string.max": "Permission name must be at most {#limit} characters",
    "any.required": "Permission name is required",
  }),
  permission_code: Joi.string()
    .min(3)
    .max(32)
    .pattern(new RegExp("^[A-Z]+_[A-Z]+$"))
    .messages({
      "string.base": "Permission code must be a string",
      "string.empty": "Permission code cannot be empty",

      "string.pattern.base":
        "Permission code must be in the format 'ACTION_NAME' (e.g. CREATE_USER)",

      "string.min": "Permission code must be at least {#limit} characters",
      "string.max": "Permission code must be at most {#limit} characters",
      "any.required": "Permission code is required",
    }),
  name: Joi.string().min(3).max(32).messages({
    "string.base": "Name must be a string",
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least {#limit} characters",
    "string.max": "Name must be at most {#limit} characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email cannot be empty",
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  number: Joi.number(),
  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&^#])[A-Za-z\\d@$!%*?&^#]{8,}$",
      ),
    )
    .messages({
      "string.base": "Password must be a string",
      "string.empty": "Password cannot be empty",
      "string.pattern.base":
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@$!%*?&^#)",
      "any.required": "Password is required",
    }),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Confirm password must match the password",
    "any.required": "Confirm password is required",
  }),
  gender: Joi.string().valid("male", "female").messages({
    "string.base": "Gender must be a string",
    "string.empty": "Gender cannot be empty",
    "any.only": "Gender must be either 'male' or 'female'",
    "any.required": "Gender is required",
  }),
  birth_date: Joi.date().iso().messages({
    "date.base": "Birth date must be a valid date",
    "date.empty": "Birth date cannot be empty",
    "date.format": "Birth date must be in ISO format",
    "any.required": "Birth date is required",
  }),
  date: Joi.date().iso(),
  country: Joi.string().messages({
    "string.base": "Country must be a string",
    "string.empty": "Country cannot be empty",
    "any.required": "Country is required",
  }),
  phone: Joi.string()
    .trim()
    .pattern(globalPhonePattern)
    .messages({
      "string.base": "Phone number must be a string",
      "string.empty": "Phone number cannot be empty",
      "string.pattern.base": "VALID_PHONE",
      "any.required": "Phone number is required",
    }),
  idToken: Joi.string().messages({
    "string.base": "ID token must be a string",
    "string.empty": "ID token cannot be empty",
    "any.required": "ID token is required",
  }),
  provider: Joi.string().valid("google", "local").messages({
    "string.base": "Provider must be a string",
    "string.empty": "Provider cannot be empty",
    "any.only": "Provider must be either 'google' or 'local'",
    "any.required": "Provider is required",
  }),
  otp: Joi.string()
    .max(6)
    .min(6)
    .regex(/^[0-9]{6}$/)
    .messages({
      "string.base": "OTP must be a string",
      "string.empty": "OTP cannot be empty",
      "string.min": "OTP must be exactly {#limit} digits",
      "string.max": "OTP must be exactly {#limit} digits",
      "string.pattern.base": "OTP must contain only numbers",
      "any.required": "OTP is required",
    }),
  // bio: Joi.string().min(16).max(300).messages({
  //   "string.base": "Bio must be a string",
  //   "string.empty": "Bio cannot be empty",
  //   "string.min": "Bio must be at least {#limit} characters",
  //   "string.max": "Bio must be at most {#limit} characters",
  //   "any.required": "Bio is required",
  // }),
  search: Joi.string().max(32).messages({
    "string.base": "Search query must be a string",
    "string.empty": "Search query cannot be empty",
    "string.max": "Search query must be at most {#limit} characters",
    "any.required": "Search query is required",
  }),
  search_Currency: Joi.string().max(32).messages({
    "string.base": "Search query must be a string",
    "string.empty": "Search query cannot be empty",
    "string.max": "Search query must be at most {#limit} characters",
    "any.required": "Search query is required",
  }),
  file: {
    fieldname: Joi.string().required().messages({
      "string.base": "File field name must be a string",
      "string.empty": "File field name cannot be empty",
      "any.required": "File field name is required",
    }),
    originalname: Joi.string().required().messages({
      "string.base": "Original file name must be a string",
      "string.empty": "Original file name cannot be empty",
      "any.required": "Original file name is required",
    }),
    encoding: Joi.string().required().messages({
      "string.base": "File encoding must be a string",
      "string.empty": "File encoding cannot be empty",
      "any.required": "File encoding is required",
    }),
    mimetype: Joi.string().required().messages({
      "string.base": "File MIME type must be a string",
      "string.empty": "File MIME type cannot be empty",
      "any.required": "File MIME type is required",
    }),
    finalPath: Joi.string().required().messages({
      "string.base": "File final path must be a string",
      "string.empty": "File final path cannot be empty",
      "any.required": "File final path is required",
    }),
    destination: Joi.string().required().messages({
      "string.base": "File destination must be a string",
      "string.empty": "File destination cannot be empty",
      "any.required": "File destination is required",
    }),
    filename: Joi.string().required().messages({
      "string.base": "Filename must be a string",
      "string.empty": "Filename cannot be empty",
      "any.required": "Filename is required",
    }),
    path: Joi.string().required().messages({
      "string.base": "File path must be a string",
      "string.empty": "File path cannot be empty",
      "any.required": "File path is required",
    }),
    size: Joi.number().positive().required().messages({
      "number.base": "File size must be a number",
      "number.positive": "File size must be a positive number",
      "any.required": "File size is required",
    }),
  },
  codeCountry: Joi.string()
    .trim()
    .pattern(countryCallingCodePattern)
    .messages({
      "string.base": "Country calling code must be a string",
      "string.empty": "Country calling code cannot be empty",
      "string.pattern.base": "VALID_COUNTRY_CALLING_CODE",
      "any.required": "Country calling code is required",
    }),
  name_en: Joi.string().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name cannot be empty",
    "any.required": "Name is required",
  }),
  name_ar: Joi.string().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name cannot be empty",
    "any.required": "Name is required",
  }),
  symbol: Joi.string().messages({
    "string.base": "Symbol must be a string",
    "string.empty": "Symbol cannot be empty",
    "any.required": "Symbol is required",
  }),
  code: Joi.string().messages({
    "string.base": "Code must be a string",
    "string.empty": "Code cannot be empty",
    "any.required": "Code is required",
  }),
  exchangeRate: Joi.number().messages({
    "number.base": "Exchange rate must be a number",
    "number.empty": "Exchange rate cannot be empty",
    "any.required": "Exchange rate is required",
  }),
  default: Joi.boolean().messages({
    "boolean.base": "Default must be a boolean",
    "boolean.empty": "Default cannot be empty",
    "any.required": "Default is required",
  }),

  description: Joi.string().min(10).max(1000).messages({
    "string.base": "Description must be a string",
    "string.empty": "Description cannot be empty",
    "any.required": "Description is required",
  }),
  price: Joi.number().positive().required().messages({
    "number.base": "Price must be a number",
    "number.positive": "Price must be a positive number",
    "any.required": "Price is required",
  }),
  duration: Joi.number().positive().required().messages({
    "number.base": "Duration must be a number",
    "number.positive": "Duration must be a positive number",
    "any.required": "Duration is required",
  }),
  sessionsCount: Joi.number().positive().required().messages({
    "number.base": "Sessions count must be a number",
    "number.positive": "Sessions count must be a positive number",
    "any.required": "Sessions count is required",
  }),
  sessionTime: Joi.number().positive().required().messages({
    "number.base": "Session time must be a number",
    "number.positive": "Session time must be a positive number",
    "any.required": "Session time is required",
  }),
  active: Joi.boolean().required().messages({
    "boolean.base": "Active must be a boolean",
    "boolean.empty": "Active cannot be empty",
    "any.required": "Active is required",
  }),
  bestSeller: Joi.boolean().required().messages({
    "boolean.base": "Best seller must be a boolean",
    "boolean.empty": "Best seller cannot be empty",
    "any.required": "Best seller is required",
  }),
  type: Joi.string().valid("full", "half").required().messages({
    "string.base": "Type must be a string",
    "string.empty": "Type cannot be empty",
    "any.required": "Type is required",
    "any.only": "Type must be either 'full' or 'half'",
  }),
  features: Joi.object().required().messages({
    "object.base": "Features must be an object",
    "object.empty": "Features cannot be empty",
    "any.required": "Features is required",
  }),
  id: Joi.string().uuid(),
  parent_recurring_id: Joi.string()
    .pattern(/^rec_.{10}$/)
    .required()
    .messages({
      "string.empty": "parent_recurring_id is required",
      "any.required": "parent_recurring_id is required",
      "string.pattern.base": "parent_recurring_id must be a valid recurring id",
    }),
  color: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .messages({
      "string.base": "Color must be a string",
      "string.empty": "Color cannot be empty",
      "string.pattern.base": "Color must be a valid hex color",
      "any.required": "Color is required",
    }),
  rescheduleCount: Joi.number().positive().messages({
    "number.base": "Reschedule count must be a number",
    "number.positive": "Reschedule count must be a positive number",
  }),

  ageRange: Joi.object({
    minAge: Joi.number().positive().required().messages({
      "number.base": "Minimum age must be a number",
      "number.positive": "Minimum age must be a positive number",
      "any.required": "Minimum age is required",
    }),
    maxAge: Joi.number().positive().required().messages({
      "number.base": "Maximum age must be a number",
      "number.positive": "Maximum age must be a positive number",
      "any.required": "Maximum age is required",
    }),
  })
    .required()
    .messages({
      "any.required": "Age range is required",
    }),
};
