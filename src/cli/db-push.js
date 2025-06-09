#!/usr/bin/env node

require("dotenv").config();
const { sequelize } = require("../config/database");
const logger = require("../utils/logger");

class DatabasePusher {
    constructor() {
        this.options = {
            force: false,
            alter: false,
            drop: false,
        };
    }

    async pushChanges(options = {}) {
        try {
            this.options = { ...this.options, ...options };

            logger.info("Starting database push...");
            logger.info(`Options: ${JSON.stringify(this.options)}`);

            // Test connection first
            await sequelize.authenticate();
            logger.info("Database connection established");

            if (this.options.drop) {
                logger.warn("⚠️  DROP mode: This will drop all tables and recreate them");
                await sequelize.drop();
                logger.info("All tables dropped");
            }

            if (this.options.force) {
                logger.warn("⚠️  FORCE mode: This will drop and recreate tables");
                await sequelize.sync({ force: true });
                logger.info("Tables force synchronized (dropped and recreated)");
            } else if (this.options.alter) {
                logger.info("🔄 ALTER mode: This will alter tables to match models");
                await sequelize.sync({ alter: true });
                logger.info("Tables altered to match models");
            } else {
                logger.info("📋 SAFE mode: This will only create new tables");
                await sequelize.sync();
                logger.info("Tables synchronized (safe mode)");
            }

            logger.info("Database push completed successfully");
        } catch (error) {
            logger.error("Error during database push:", error);
            throw error;
        }
    }

    async createTable(tableName) {
        try {
            const models = require("../models");
            const model = models[tableName];

            if (!model) {
                throw new Error(`Model ${tableName} not found`);
            }

            logger.info(`Creating table for model: ${tableName}`);
            await model.sync();
            logger.info(`Table created for model: ${tableName}`);
        } catch (error) {
            logger.error(`Error creating table for ${tableName}:`, error);
            throw error;
        }
    }

    async dropTable(tableName) {
        try {
            const models = require("../models");
            const model = models[tableName];

            if (!model) {
                throw new Error(`Model ${tableName} not found`);
            }

            logger.warn(`⚠️  Dropping table for model: ${tableName}`);
            await model.drop();
            logger.info(`Table dropped for model: ${tableName}`);
        } catch (error) {
            logger.error(`Error dropping table for ${tableName}:`, error);
            throw error;
        }
    }

    async alterTable(tableName) {
        try {
            const models = require("../models");
            const model = models[tableName];

            if (!model) {
                throw new Error(`Model ${tableName} not found`);
            }

            logger.info(`Altering table for model: ${tableName}`);
            await model.sync({ alter: true });
            logger.info(`Table altered for model: ${tableName}`);
        } catch (error) {
            logger.error(`Error altering table for ${tableName}:`, error);
            throw error;
        }
    }

    async showStatus() {
        try {
            await sequelize.authenticate();

            const queryInterface = sequelize.getQueryInterface();
            const tables = await queryInterface.showAllTables();

            console.log("📊 Database Status:");
            console.log(`Connected to: ${sequelize.config.database}`);
            console.log(`Host: ${sequelize.config.host}:${sequelize.config.port}`);
            console.log(`Dialect: ${sequelize.config.dialect}`);
            console.log(`Tables (${tables.length}):`);

            if (tables.length > 0) {
                tables.forEach((table) => {
                    console.log(`  - ${table}`);
                });
            } else {
                console.log("  No tables found");
            }
        } catch (error) {
            console.error("❌ Error getting database status:", error.message);
            throw error;
        }
    }

    async listModels() {
        try {
            const models = require("../models");
            const modelNames = Object.keys(models).filter(
                (key) => key !== "sequelize" && key !== "Sequelize"
            );

            console.log("📋 Available Models:");
            if (modelNames.length > 0) {
                modelNames.forEach((modelName) => {
                    console.log(`  - ${modelName}`);
                });
            } else {
                console.log("  No models found");
            }
        } catch (error) {
            console.error("❌ Error listing models:", error.message);
            throw error;
        }
    }
}

// CLI interface
if (require.main === module) {
    const pusher = new DatabasePusher();
    const args = process.argv.slice(2);
    const command = args[0];
    const modelName = args[1];

    switch (command) {
        case "safe":
            pusher
                .pushChanges({ force: false, alter: false })
                .then(() => {
                    console.log("✅ Database pushed successfully (safe mode)");
                    process.exit(0);
                })
                .catch((error) => {
                    console.error("❌ Failed to push database:", error.message);
                    process.exit(1);
                });
            break;

        case "alter":
            pusher
                .pushChanges({ alter: true })
                .then(() => {
                    console.log("✅ Database pushed successfully (alter mode)");
                    process.exit(0);
                })
                .catch((error) => {
                    console.error("❌ Failed to push database:", error.message);
                    process.exit(1);
                });
            break;

        case "force":
            console.log("⚠️  WARNING: This will drop and recreate all tables!");
            console.log("⚠️  All data will be lost!");
            console.log("⚠️  Press Ctrl+C to cancel...");

            setTimeout(() => {
                pusher
                    .pushChanges({ force: true })
                    .then(() => {
                        console.log("✅ Database pushed successfully (force mode)");
                        process.exit(0);
                    })
                    .catch((error) => {
                        console.error("❌ Failed to push database:", error.message);
                        process.exit(1);
                    });
            }, 3000);
            break;

        case "drop":
            console.log("⚠️  WARNING: This will drop all tables!");
            console.log("⚠️  All data will be lost!");
            console.log("⚠️  Press Ctrl+C to cancel...");

            setTimeout(() => {
                pusher
                    .pushChanges({ drop: true })
                    .then(() => {
                        console.log("✅ Database dropped successfully");
                        process.exit(0);
                    })
                    .catch((error) => {
                        console.error("❌ Failed to drop database:", error.message);
                        process.exit(1);
                    });
            }, 3000);
            break;

        case "create":
            if (!modelName) {
                console.error(
                    "❌ Please provide model name: npm run db:push create <ModelName>"
                );
                process.exit(1);
            }

            pusher
                .createTable(modelName)
                .then(() => {
                    console.log(`✅ Table created for model ${modelName}`);
                    process.exit(0);
                })
                .catch((error) => {
                    console.error(
                        `❌ Failed to create table for ${modelName}:`,
                        error.message
                    );
                    process.exit(1);
                });
            break;

        case "alter-table":
            if (!modelName) {
                console.error(
                    "❌ Please provide model name: npm run db:push alter-table <ModelName>"
                );
                process.exit(1);
            }

            pusher
                .alterTable(modelName)
                .then(() => {
                    console.log(`✅ Table altered for model ${modelName}`);
                    process.exit(0);
                })
                .catch((error) => {
                    console.error(
                        `❌ Failed to alter table for ${modelName}:`,
                        error.message
                    );
                    process.exit(1);
                });
            break;

        case "drop-table":
            if (!modelName) {
                console.error(
                    "❌ Please provide model name: npm run db:push drop-table <ModelName>"
                );
                process.exit(1);
            }

            console.log(`⚠️  WARNING: This will drop table for model ${modelName}!`);
            console.log("⚠️  All data in this table will be lost!");
            console.log("⚠️  Press Ctrl+C to cancel...");

            setTimeout(() => {
                pusher
                    .dropTable(modelName)
                    .then(() => {
                        console.log(`✅ Table dropped for model ${modelName}`);
                        process.exit(0);
                    })
                    .catch((error) => {
                        console.error(
                            `❌ Failed to drop table for ${modelName}:`,
                            error.message
                        );
                        process.exit(1);
                    });
            }, 3000);
            break;

        case "status":
            pusher
                .showStatus()
                .then(() => process.exit(0))
                .catch((error) => {
                    console.error("❌ Failed to get database status:", error.message);
                    process.exit(1);
                });
            break;

        case "models":
            pusher.listModels();
            process.exit(0);
            break;

        default:
            console.log("🚀 Database Pusher");
            console.log("Usage:");
            console.log(
                "  npm run db:push safe                   - Sync database (safe mode, only create new)"
            );
            console.log(
                "  npm run db:push alter                 - Sync database (alter existing tables)"
            );
            console.log(
                "  npm run db:push force                 - Sync database (drop and recreate all tables)"
            );
            console.log("  npm run db:push drop                  - Drop all tables");
            console.log(
                "  npm run db:push create <ModelName>    - Create table for specific model"
            );
            console.log("  npm run db:push alter-table <Model>   - Alter specific table");
            console.log("  npm run db:push drop-table <Model>    - Drop specific table");
            console.log("  npm run db:push status                - Show database status");
            console.log(
                "  npm run db:push models                - List available models"
            );
            console.log("");
            console.log("Examples:");
            console.log("  npm run db:push safe");
            console.log("  npm run db:push alter");
            console.log("  npm run db:push create User");
            console.log("  npm run db:push status");
            process.exit(0);
    }
}

module.exports = DatabasePusher;
