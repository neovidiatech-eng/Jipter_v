import Joi from "joi";

export const updateSettingsSchema = {
    body: Joi.object({
        userPrefix: Joi.string().min(2).max(50),
        socialLinks: Joi.object(),
        contactInfo: Joi.object()
    })
};
