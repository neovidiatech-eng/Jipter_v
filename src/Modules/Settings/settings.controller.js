import { asyncHandler, successResponse, errorResponse } from "../../Utils/Response.js";
import * as db from "../../database/dbService.js";

export const getSettings = asyncHandler(async (req, res, next) => {
    let settings = await db.findFirst({
        model: "settings"
    });

    if (!settings) {
        settings = await db.create({
            model: "settings",
            data: {
                userPrefix: "jupiter",
                socialLinks: {},
                contactInfo: {}
            }
        });
    }

    return successResponse({
        res,
        req,
        message: "FETCH_SUCCESS",
        data: settings,
        status: 200
    });
});

export const updateSettings = asyncHandler(async (req, res, next) => {
    const { userPrefix, socialLinks, contactInfo } = req.body;

    let settings = await db.findFirst({
        model: "settings"
    });

    if (!settings) {
        settings = await db.create({
            model: "settings",
            data: {
                userPrefix: userPrefix || "jupiter",
                socialLinks: socialLinks || {},
                contactInfo: contactInfo || {}
            }
        });
    } else {
        const data = {};
        if (userPrefix !== undefined) data.userPrefix = userPrefix;
        if (socialLinks !== undefined) data.socialLinks = socialLinks;
        if (contactInfo !== undefined) data.contactInfo = contactInfo;

        settings = await db.updateOne({
            model: "settings",
            where: { id: settings.id },
            data
        });
    }

    return successResponse({
        res,
        req,
        message: "UPDATE_SUCCESS",
        data: settings,
        status: 200
    });
});

