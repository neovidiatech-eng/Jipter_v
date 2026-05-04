import cloudinary from "./index.js";
import fs from "node:fs";

/**
 * Uploads a file to Cloudinary and removes the local file.
 * @param {Object} file - The file object from Multer (req.file)
 * @param {String} folder - The folder name in Cloudinary
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadToCloudinary = async (file, folder = "general") => {
    try {
        if (!file) return null;

        const result = await cloudinary.uploader.upload(file.path, {
            folder: `jipter/${folder}`,
            resource_type: "auto"
        });

        // Remove local file after successful upload
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        return {
            secure_url: result.secure_url,
            public_id: result.public_id
        };
    } catch (error) {
        // Ensure local file is removed even if upload fails
        if (file && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        throw error;
    }
};

/**
 * Deletes an image from Cloudinary.
 * @param {String} public_id - The public ID of the image
 */
export const deleteFromCloudinary = async (public_id) => {
    if (!public_id) return;
    await cloudinary.uploader.destroy(public_id);
};
