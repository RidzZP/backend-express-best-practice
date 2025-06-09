const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

// Create rate limiter
const rateLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        status: "error",
        message: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            status: "error",
            message: "Too many requests from this IP, please try again later.",
        });
    },
    skip: (req) => {
        // Skip rate limiting for health check
        return req.path === "/health";
    },
});

module.exports = rateLimiter;
