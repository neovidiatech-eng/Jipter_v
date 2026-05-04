import { asyncHandler, successResponse, errorResponse } from "../../Utils/Response.js";
import * as db from "../../database/dbService.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../../Utils/Cloudinary/upload.js";

export const updateProfileImage = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return errorResponse({ req, next, message: "FILE_REQUIRED", status: 400 });
    }

    const user = await db.findOne({
        model: "user",
        where: { id: req.user.id }
    });

    // Delete old image from Cloudinary if it exists
    if (user.image && user.image.public_id) {
        await deleteFromCloudinary(user.image.public_id);
    }

    // Upload new image
    const { secure_url, public_id } = await uploadToCloudinary(req.file, "profiles");

    // Update user record
    const updatedUser = await db.updateOne({
        model: "user",
        where: { id: req.user.id },
        data: {
            image: { secure_url, public_id }
        }
    });

    return successResponse({
        res,
        req,
        message: "PROFILE_IMAGE_UPDATED",
        data: { image: updatedUser.image },
        status: 200
    });
});
