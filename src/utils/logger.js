const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Ambil path dari .env
const logPaths = {
    all: process.env.LOG_FILE_ALL || "logs/daily/all",
    access: process.env.LOG_FILE_ACCESS || "logs/daily/access",
    error: process.env.LOG_FILE_ERROR || "logs/daily/error",
};

// Buat semua folder jika belum ada
Object.values(logPaths).forEach((logPath) => {
    const dir = path.dirname(logPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Format log
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
);

// Format console
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level}]: ${stack || message}`;
    })
);

// Transports
const transports = [
    new winston.transports.Console({
        format: consoleFormat,
        level: process.env.NODE_ENV === "production" ? "warn" : "debug",
    }),
];

if (process.env.NODE_ENV !== "test") {
    // Error log
    transports.push(
        new DailyRotateFile({
            filename: `${logPaths.error}-%DATE%.log`,
            datePattern: "YYYY-MM-DD",
            level: "error",
            format: logFormat,
            maxFiles: "30d",
            maxSize: "20m",
            zippedArchive: true,
        })
    );

    // All log
    transports.push(
        new DailyRotateFile({
            filename: `${logPaths.all}-%DATE%.log`,
            datePattern: "YYYY-MM-DD",
            format: logFormat,
            maxFiles: "30d",
            maxSize: "20m",
            zippedArchive: true,
        })
    );

    // Access log
    transports.push(
        new DailyRotateFile({
            filename: `${logPaths.access}-%DATE%.log`,
            datePattern: "YYYY-MM-DD",
            level: "info",
            format: logFormat,
            maxFiles: "30d",
            maxSize: "20m",
            zippedArchive: true,
        })
    );
}

// Buat logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: logFormat,
    transports,
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(path.dirname(logPaths.all), "exceptions.log"),
        }),
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(path.dirname(logPaths.all), "rejections.log"),
        }),
    ],
});

// Logging helper
logger.logRequest = (req, res, statusCode, responseTime) => {
    const logData = {
        method: req.method,
        url: req.originalUrl,
        statusCode,
        responseTime: `${responseTime}ms`,
        userAgent: req.get("User-Agent"),
        ip: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString(),
    };

    if (statusCode >= 400) {
        logger.warn("HTTP Request", logData);
    } else {
        logger.info("HTTP Request", logData);
    }
};

module.exports = logger;
