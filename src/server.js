require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");

const logger = require("./utils/logger");
const { connectDatabase } = require("./config/database");

// Test logger before proceeding
try {
    logger.info("Starting server initialization...");
} catch (loggerError) {
    console.error("Logger initialization failed:", loggerError);
    process.exit(1);
}

// Setup global error handlers first
let errorMiddlewares;
try {
    errorMiddlewares = require("./middlewares/errorHandler");
    const { setupGlobalErrorHandlers } = errorMiddlewares;
    setupGlobalErrorHandlers();
    logger.info("Global error handlers configured successfully");
} catch (middlewareError) {
    logger.error("Failed to load error middlewares:", middlewareError);
    console.error("Error middleware loading error:", middlewareError);
    process.exit(1);
}

let apiRoutes;
try {
    apiRoutes = require("./routes");
} catch (routesError) {
    logger.error("Failed to load routes:", routesError);
    console.error("Routes loading error:", routesError);
    process.exit(1);
}

let swaggerRoutes;
try {
    swaggerRoutes = require("./routes/swagger");
} catch (swaggerError) {
    logger.warn("Swagger routes not available:", swaggerError.message);
    swaggerRoutes = null;
}

const { errorHandler, notFoundHandler } = errorMiddlewares;

let rateLimiter;
try {
    rateLimiter = require("./middlewares/rateLimiter");
} catch (rateLimiterError) {
    logger.error("Failed to load rate limiter:", rateLimiterError);
    console.error("Rate limiter loading error:", rateLimiterError);
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

logger.info("Express app initialized successfully");

// Security middlewares
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
    })
);
app.use(cors());
app.use(compression());

// Rate limiting
app.use(rateLimiter);

// Request logging
app.use(
    morgan("combined", {
        stream: {
            write: (message) => logger.info(message.trim()),
        },
    })
);

// Body parsing middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static file serving for uploaded images
app.use("/image", express.static(path.join(__dirname, "../public/image")));

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Server is running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// Documentation routes (Swagger)
if (swaggerRoutes) {
    app.use("/", swaggerRoutes);
    logger.info("Swagger documentation routes loaded successfully");
}

// API routes
app.use(process.env.API_PREFIX || "/api", apiRoutes);

// Error handling middlewares
app.use(notFoundHandler);
app.use(errorHandler);

logger.info("All middlewares and routes configured successfully");

// Start server
const startServer = async () => {
    try {
        logger.info("Attempting to connect to database...");
        // Connect to database
        await connectDatabase();
        logger.info("Database connection successful");

        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV}`);
            logger.info(`Health check: http://localhost:${PORT}/health`);
            logger.info(
                `API endpoints: http://localhost:${PORT}${
                    process.env.API_PREFIX || "/api"
                }`
            );
            logger.info(
                `Excel export endpoints: http://localhost:${PORT}${
                    process.env.API_PREFIX || "/api"
                }/v1/export`
            );
        });
    } catch (error) {
        logger.error("Failed to start server:", error);
        console.error("Server startup error:", error);
        console.error("Error stack:", error.stack);
        process.exit(1);
    }
};

logger.info("Starting server...");
startServer();
