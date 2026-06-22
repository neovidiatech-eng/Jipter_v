import bcrypt from "bcryptjs";
import CryptoJS from "crypto-js";
export const hash = async ({ password }) => {
  return encryptText({ text: password });
};
export const compare = async ({ password, hash }) => {
  if (!hash) return false;
  try {
    const decrypted = await decryptText({ text: hash });
    if (decrypted && decrypted !== hash) {
      return password === decrypted;
    }
  } catch (err) {
    // ignore and fallback
  }
  if (password === hash) {
    return true;
  }
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    return false;
  }
};

export const encryptText = ({ text }) => {
  return CryptoJS.AES.encrypt(text, process.env.ENCRYPT_KEY).toString();
};

export const decryptText = async ({ text }) => {
  try {
    if (!text) return null;

    const bytes = CryptoJS.AES.decrypt(text, process.env.ENCRYPT_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    // If decryption results in an empty string but original text wasn't empty,
    // it's likely the text was not encrypted or the key is wrong.
    if (!decrypted && text) {
      return text;
    }

    return decrypted;
  } catch (err) {
    // If it's a malformed UTF-8 error, return the original text (it might not be encrypted)
    if (err.message.includes("Malformed UTF-8 data")) {
      return text;
    }
    console.error("Decrypt error:", err);
    return null;
  }
};