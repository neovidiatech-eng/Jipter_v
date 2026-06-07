import { getMessage } from "../Utils/i18n.js";

export const langMiddleware = (req, res, next) => {
  const lang = "en";

  // Attach to request object
  req.lang = lang;
  req.t = (key, params) => getMessage(key, lang, params);
  next();
};

