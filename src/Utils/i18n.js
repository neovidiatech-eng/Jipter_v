import en from "../Locales/en.json" with { type: "json" };

const locales = { en };

/**
 * Get translated message for a given key and language
 * @param {string} key - Message key (e.g. "USER_CREATED_SUCCESS")
 * @param {string} lang - Language code (forced to "en")
 * @param {object} params - Dynamic parameters to replace in the string
 * @returns {string} - Translated and formatted message
 */
export const getMessage = (key, lang = "en", params = {}) => {
  // Always use English
  const language = locales["en"];

  // Get raw message, fallback to key if missing in file
  let message = language[key] || key;

  // Replace parameters like {{name}}
  if (params && typeof params === "object") {
    Object.keys(params).forEach((param) => {
      message = message.replace(new RegExp(`{{${param}}}`, "g"), params[param]);
    });
  }

  return message;
};

/**
 * Check if the language is RTL (forced to ltr for English)
 * @returns {string} "ltr"
 */
export const getDir = () => "ltr";

