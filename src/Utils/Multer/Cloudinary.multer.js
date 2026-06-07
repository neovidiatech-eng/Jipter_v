import multer from "multer";

export const fileValidation = {
    image: ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"],
    video: ["video/mp4", "video/mpeg", "video/ogg", "video/webm"],
    pdf: ["application/pdf"],
    document: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
};

export const cloudinaryMulterUpload = ({ validation = [] } = {}) => {
    const storage = multer.diskStorage({});

    const fileFilter = (req, file, cb) => {
        const flatValidation = validation.flat();
        if (flatValidation.length === 0 || flatValidation.includes(file.mimetype)) {
            return cb(null, true);
        }
        return cb(new Error("Invalid File Format"), false);
    };

    return multer({ fileFilter, storage });
};
