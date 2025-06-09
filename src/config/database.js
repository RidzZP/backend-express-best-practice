const { Sequelize } = require("sequelize");
const logger = require("../utils/logger");

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    dialect: process.env.DB_DIALECT || "mysql",
    dialectModule: require("mysql2"),
    // Disable SQL query logging to prevent INFORMATION_SCHEMA queries from appearing in logs
    logging: false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    define: {
        timestamps: false,
        underscored: false,
        paranoid: false,
        freezeTableName: true,
    },
    timezone: "+07:00",
};

// Create Sequelize instance
const sequelize = new Sequelize(dbConfig);

// Test database connection
const connectDatabase = async () => {
    try {
        await sequelize.authenticate();
        logger.info("Database connection established successfully");

        // Check if tables exist before syncing
        const queryInterface = sequelize.getQueryInterface();
        const tables = await queryInterface.showAllTables();

        if (process.env.NODE_ENV === "development") {
            // Only sync if tables don't exist or force sync is requested
            if (tables.length === 0 || process.env.FORCE_SYNC === "true") {
                await sequelize.sync({
                    force: process.env.FORCE_SYNC === "true",
                    alter: false,
                });
                logger.info("Database models synchronized");
            } else {
                logger.info("Database tables already exist, skipping sync");
            }
        } else {
            // In production, only ensure tables exist without altering
            if (tables.length === 0) {
                await sequelize.sync({ alter: false });
                logger.info("Database tables created");
            } else {
                logger.info("Database tables verified");
            }
        }
    } catch (error) {
        logger.error("Unable to connect to database:", error);

        // Try to create database if it doesn't exist
        if (error.original?.code === "ER_BAD_DB_ERROR") {
            try {
                await createDatabaseIfNotExists();
                await sequelize.authenticate();
                await sequelize.sync({ force: false });
                logger.info("Database created and synchronized successfully");
            } catch (createError) {
                logger.error("Failed to create database:", createError);
                throw createError;
            }
        } else {
            throw error;
        }
    }
};

// Create database if it doesn't exist
const createDatabaseIfNotExists = async () => {
    const mysql = require("mysql2/promise");

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
    });

    try {
        await connection.execute(
            `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
        );
        logger.info(`Database ${process.env.DB_NAME} created or already exists`);
    } finally {
        await connection.end();
    }
};

// Force sync database (for development only)
const forceSyncDatabase = async () => {
    try {
        logger.warn("Force syncing database - this will recreate all tables");
        await sequelize.sync({ force: true });
        logger.info("Database force sync completed");
    } catch (error) {
        logger.error("Force sync failed:", error);
        throw error;
    }
};

// Close database connection
const closeDatabase = async () => {
    try {
        await sequelize.close();
        logger.info("Database connection closed");
    } catch (error) {
        logger.error("Error closing database connection:", error);
        throw error;
    }
};

// Get raw MySQL connection for database introspection
const getRawConnection = async () => {
    const mysql = require("mysql2/promise");

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    return connection;
};

module.exports = {
    sequelize,
    connectDatabase,
    closeDatabase,
    getRawConnection,
    dbConfig,
    createDatabaseIfNotExists,
    forceSyncDatabase,
};
