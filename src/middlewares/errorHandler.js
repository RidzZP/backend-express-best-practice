const logger = require("../utils/logger");

// Custom error class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Setup global error handlers
const setupGlobalErrorHandlers = () => {
    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
        logger.error("Uncaught Exception:", {
            message: err.message,
            stack: err.stack,
            type: "uncaughtException",
        });
        console.error("Uncaught Exception:", err);
        process.exit(1);
    });

    // Handle unhandled promise rejections - improved version
    process.on("unhandledRejection", (reason, promise) => {
        logger.error("Unhandled Promise Rejection:", {
            reason: reason,
            promise: promise,
            stack: reason?.stack,
            type: "unhandledRejection",
        });

        console.error("Unhandled Rejection at:", promise, "reason:", reason);

        // Don't exit process for operational errors
        if (reason instanceof AppError && reason.isOperational) {
            logger.warn("Operational error detected, continuing...");
            return;
        }

        // Only exit for critical/non-operational errors
        logger.error("Non-operational error detected, may need manual intervention");
    });

    // Handle SIGTERM
    process.on("SIGTERM", () => {
        logger.info("SIGTERM received, shutting down gracefully");
        process.exit(0);
    });

    // Handle SIGINT (Ctrl+C)
    process.on("SIGINT", () => {
        logger.info("SIGINT received, shutting down gracefully");
        process.exit(0);
    });
};

// Not found handler
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};

// Global error handler - Enhanced version
const errorHandler = (error, req, res, next) => {
    let { statusCode = 500, message } = error;

    // Log error with more details
    logger.error({
        error: {
            message: error.message,
            stack: error.stack,
            statusCode,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            isOperational: error.isOperational,
            timestamp: new Date().toISOString(),
        },
    });

    // Handle specific error types
    if (error.name === "CastError") {
        message = "Invalid ID format";
        statusCode = 400;
    } else if (error.name === "ValidationError") {
        message = Object.values(error.errors)
            .map((val) => val.message)
            .join(", ");
        statusCode = 400;
    } else if (error.name === "SequelizeValidationError") {
        message = error.errors.map((err) => err.message).join(", ");
        statusCode = 400;
    } else if (error.name === "SequelizeUniqueConstraintError") {
        message = "Duplicate field value";
        statusCode = 400;
    } else if (error.name === "SequelizeForeignKeyConstraintError") {
        message = "Foreign key constraint error";
        statusCode = 400;
    } else if (error.name === "SequelizeDatabaseError") {
        logger.error("Database error details:", error.original);
        message = "Database operation failed";
        statusCode = 500;
    } else if (error.name === "SequelizeConnectionError") {
        message = "Database connection error";
        statusCode = 500;
    } else if (error.name === "JsonWebTokenError") {
        message = "Invalid token";
        statusCode = 401;
    } else if (error.name === "TokenExpiredError") {
        message = "Token expired";
        statusCode = 401;
    }

    // Don't send stack trace in production unless it's a development environment
    const response = {
        status: error.status || "error",
        message,
        ...(process.env.NODE_ENV === "development" && {
            stack: error.stack,
            originalError: error.name,
        }),
    };

    // Ensure response is sent
    if (!res.headersSent) {
        res.status(statusCode).json(response);
    }
};

// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    AppError,
    setupGlobalErrorHandlers,
    notFoundHandler,
    errorHandler,
    asyncHandler,
};
