require("dotenv").config();
const {
    sequelize,
    connectDatabase,
    createDatabaseIfNotExists,
} = require("../config/database");
const logger = require("../utils/logger");

async function initializeDatabase() {
    try {
        logger.info("Starting database initialization...");

        // Create database if it doesn't exist
        await createDatabaseIfNotExists();

        // Connect and sync models
        await connectDatabase();

        // Force create tables for development
        if (process.env.NODE_ENV === "development") {
            await sequelize.sync({ force: false, alter: true });
            logger.info("Database tables created/updated successfully");
        }

        // Test the Product model
        const { Product } = require("../models");

        // Try to describe the table structure
        const tableInfo = await sequelize.getQueryInterface().describeTable("product");
        logger.info("Product table structure:", tableInfo);

        logger.info("Database initialization completed successfully");
        process.exit(0);
    } catch (error) {
        logger.error("Database initialization failed:", error);
        process.exit(1);
    }
}

if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase };
