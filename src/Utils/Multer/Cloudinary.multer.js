import multer from "multer";

export const fileValidation = {
    image: ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"],
    video: ["video/mp4", "video/mpeg", "video/ogg", "video/webm", "video/quicktime", "video/3gpp"],
    audio: [
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/wave",
        "audio/x-wav",
        "audio/ogg",
        "audio/webm",
        "audio/m4a",
        "audio/x-m4a",
        "audio/aac",
        "audio/mp4",
        "audio/flac"
    ],
    pdf: ["application/pdf"],
    document: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain"
    ]
};
fileValidation.chat = [
    ...fileValidation.image,
    ...fileValidation.video,
    ...fileValidation.audio,
    ...fileValidation.document
];

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
