const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// Supported image formats
const SUPPORTED_FORMATS = ["jpg", "jpeg", "png", "webp", "gif"];
const SUPPORTED_MIMETYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
];

// Create reusable upload middleware factory
const createUploadMiddleware = (config = {}) => {
    const {
        destination = "public/image/general",
        fieldName = "image",
        maxFileSize = 2 * 1024 * 1024, // 2MB default
        maxFiles = 1,
        compress = true,
        quality = 80,
        maxWidth = 1920,
        maxHeight = 1080,
    } = config;

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(__dirname, `../../${destination}`);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Configure multer storage
    const storage = multer.memoryStorage();

    // Enhanced file filter
    const fileFilter = (req, file, cb) => {
        // Check MIME type
        if (!SUPPORTED_MIMETYPES.includes(file.mimetype.toLowerCase())) {
            const error = new Error(
                `Invalid file type. Supported formats: ${SUPPORTED_FORMATS.join(", ")}`
            );
            error.code = "INVALID_FILE_TYPE";
            return cb(error, false);
        }

        // Check file extension
        const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
        if (!SUPPORTED_FORMATS.includes(fileExtension)) {
            const error = new Error(
                `Invalid file extension. Supported formats: ${SUPPORTED_FORMATS.join(
                    ", "
                )}`
            );
            error.code = "INVALID_FILE_EXTENSION";
            return cb(error, false);
        }

        cb(null, true);
    };

    // Configure multer
    const upload = multer({
        storage: storage,
        limits: {
            fileSize: maxFileSize,
        },
        fileFilter: fileFilter,
    });

    // Middleware for single file upload
    const uploadSingle = upload.single(fieldName);

    // Middleware for multiple files upload
    const uploadMultiple = upload.array(fieldName, maxFiles);

    // Process and save image with compression
    const processImage = async (file, outputPath) => {
        try {
            if (!compress) {
                fs.writeFileSync(outputPath, file.buffer);
                return;
            }

            // Compress image using sharp
            let sharpInstance = sharp(file.buffer);

            // Get image metadata
            const metadata = await sharpInstance.metadata();

            // Resize if image is too large
            if (metadata.width > maxWidth || metadata.height > maxHeight) {
                sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
                    fit: "inside",
                    withoutEnlargement: true,
                });
            }

            // Apply compression based on format
            const outputFormat = path.extname(outputPath).toLowerCase().slice(1);

            switch (outputFormat) {
                case "jpg":
                case "jpeg":
                    await sharpInstance
                        .jpeg({ quality: quality, progressive: true })
                        .toFile(outputPath);
                    break;

                case "png":
                    await sharpInstance
                        .png({ quality: quality, progressive: true })
                        .toFile(outputPath);
                    break;

                case "webp":
                    await sharpInstance.webp({ quality: quality }).toFile(outputPath);
                    break;

                default:
                    await sharpInstance.toFile(outputPath);
            }
        } catch (error) {
            console.error("Error processing image:", error);
            throw error;
        }
    };

    // Single file upload handler
    const handleSingleUpload = (req, res, next) => {
        uploadSingle(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({
                        status: "error",
                        message: `File too large. Maximum size is ${Math.round(
                            maxFileSize / (1024 * 1024)
                        )}MB.`,
                    });
                }
                return res.status(400).json({
                    status: "error",
                    message: "Upload error: " + err.message,
                });
            } else if (err) {
                return res.status(400).json({
                    status: "error",
                    message: err.message,
                });
            }

            if (req.file) {
                try {
                    // Generate unique filename
                    const uniqueSuffix =
                        Date.now() + "-" + Math.round(Math.random() * 1e9);
                    const fileExtension = path.extname(req.file.originalname);
                    const filename = "img-" + uniqueSuffix + fileExtension;
                    const outputPath = path.join(uploadDir, filename);

                    // Process and save image
                    await processImage(req.file, outputPath);

                    // Add relative path to request body
                    const relativePath = `/${destination.replace(
                        "public/",
                        ""
                    )}/${filename}`;
                    req.body[fieldName] = relativePath;
                } catch (processError) {
                    console.error("Error processing uploaded file:", processError);
                    return res.status(500).json({
                        status: "error",
                        message: "Error processing uploaded image",
                    });
                }
            }

            next();
        });
    };

    // Multiple files upload handler
    const handleMultipleUpload = (req, res, next) => {
        uploadMultiple(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({
                        status: "error",
                        message: `One or more files too large. Maximum size is ${Math.round(
                            maxFileSize / (1024 * 1024)
                        )}MB per file.`,
                    });
                }
                return res.status(400).json({
                    status: "error",
                    message: "Upload error: " + err.message,
                });
            } else if (err) {
                return res.status(400).json({
                    status: "error",
                    message: err.message,
                });
            }

            if (req.files && req.files.length > 0) {
                try {
                    const processedFiles = [];

                    for (const file of req.files) {
                        // Generate unique filename
                        const uniqueSuffix =
                            Date.now() + "-" + Math.round(Math.random() * 1e9);
                        const fileExtension = path.extname(file.originalname);
                        const filename = "img-" + uniqueSuffix + fileExtension;
                        const outputPath = path.join(uploadDir, filename);

                        // Process and save image
                        await processImage(file, outputPath);

                        // Add relative path
                        const relativePath = `/${destination.replace(
                            "public/",
                            ""
                        )}/${filename}`;
                        processedFiles.push(relativePath);
                    }

                    req.body[fieldName + "s"] = processedFiles;
                } catch (processError) {
                    console.error("Error processing uploaded files:", processError);
                    return res.status(500).json({
                        status: "error",
                        message: "Error processing uploaded images",
                    });
                }
            }

            next();
        });
    };

    return {
        single: handleSingleUpload,
        multiple: handleMultipleUpload,
    };
};

// Utility function to delete uploaded file
const deleteUploadedFile = (filePath) => {
    try {
        // Convert relative path to absolute path
        const absolutePath = path.join(
            __dirname,
            "../../public",
            filePath.replace(/^\//, "")
        );

        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error deleting file:", error);
        return false;
    }
};

// Pre-configured middleware for common use cases
const productImageUpload = createUploadMiddleware({
    destination: "public/image/product",
    fieldName: "foto",
    maxFileSize: 2 * 1024 * 1024, // 2MB
    compress: true,
    quality: 85,
});

const userAvatarUpload = createUploadMiddleware({
    destination: "public/image/avatar",
    fieldName: "avatar",
    maxFileSize: 1 * 1024 * 1024, // 1MB
    compress: true,
    quality: 90,
    maxWidth: 512,
    maxHeight: 512,
});

const categoryImageUpload = createUploadMiddleware({
    destination: "public/image/category",
    fieldName: "image",
    maxFileSize: 2 * 1024 * 1024, // 2MB
    compress: true,
    quality: 80,
});

module.exports = {
    createUploadMiddleware,
    deleteUploadedFile,
    // Pre-configured middlewares
    productImageUpload,
    userAvatarUpload,
    categoryImageUpload,
    // Legacy compatibility
    handleImageUpload: productImageUpload.single,
};
