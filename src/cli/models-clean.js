#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

class ModelsCleaner {
    constructor() {
        this.modelsDir = path.join(__dirname, "../models");
    }

    async cleanModels() {
        try {
            logger.info("Starting models cleanup...");

            // Check if models directory exists
            if (!fs.existsSync(this.modelsDir)) {
                logger.warn("Models directory does not exist");
                return;
            }

            // Read all files in models directory
            const files = fs.readdirSync(this.modelsDir);

            // Filter only .js files and exclude index.js
            const modelFiles = files.filter(
                (file) =>
                    file.endsWith(".js") &&
                    file !== "index.js" &&
                    !file.endsWith(".test.js")
            );

            if (modelFiles.length === 0) {
                logger.info("No model files found to clean");
                return;
            }

            logger.info(
                `Found ${modelFiles.length} model files: ${modelFiles.join(", ")}`
            );

            // Delete each model file
            let deletedCount = 0;
            for (const file of modelFiles) {
                const filePath = path.join(this.modelsDir, file);

                try {
                    fs.unlinkSync(filePath);
                    logger.info(`Deleted model file: ${file}`);
                    deletedCount++;
                } catch (error) {
                    logger.error(`Failed to delete ${file}:`, error.message);
                }
            }

            logger.info(`Models cleanup completed. Deleted ${deletedCount} model files`);
        } catch (error) {
            logger.error("Error during models cleanup:", error);
            throw error;
        }
    }

    async cleanSpecificModel(modelName) {
        try {
            const fileName = `${modelName}.js`;
            const filePath = path.join(this.modelsDir, fileName);

            if (!fs.existsSync(filePath)) {
                logger.warn(`Model file ${fileName} does not exist`);
                return;
            }

            fs.unlinkSync(filePath);
            logger.info(`Deleted model file: ${fileName}`);
        } catch (error) {
            logger.error(`Error deleting model ${modelName}:`, error);
            throw error;
        }
    }

    listModels() {
        try {
            if (!fs.existsSync(this.modelsDir)) {
                console.log("❌ Models directory does not exist");
                return;
            }

            const files = fs.readdirSync(this.modelsDir);
            const modelFiles = files.filter(
                (file) =>
                    file.endsWith(".js") &&
                    file !== "index.js" &&
                    !file.endsWith(".test.js")
            );

            if (modelFiles.length === 0) {
                console.log("📁 No model files found");
                return;
            }

            console.log(`📁 Found ${modelFiles.length} model files:`);
            modelFiles.forEach((file) => {
                console.log(`  - ${file}`);
            });
        } catch (error) {
            console.error("❌ Error listing models:", error.message);
        }
    }
}

// CLI interface
if (require.main === module) {
    const cleaner = new ModelsCleaner();
    const args = process.argv.slice(2);
    const command = args[0];
    const modelName = args[1];

    switch (command) {
        case "all":
            cleaner
                .cleanModels()
                .then(() => {
                    console.log("✅ All models cleaned successfully");
                    process.exit(0);
                })
                .catch((error) => {
                    console.error("❌ Failed to clean models:", error.message);
                    process.exit(1);
                });
            break;

        case "model":
            if (!modelName) {
                console.error(
                    "❌ Please provide model name: npm run models:clean model <ModelName>"
                );
                process.exit(1);
            }

            cleaner
                .cleanSpecificModel(modelName)
                .then(() => {
                    console.log(`✅ Model ${modelName} cleaned successfully`);
                    process.exit(0);
                })
                .catch((error) => {
                    console.error(
                        `❌ Failed to clean model ${modelName}:`,
                        error.message
                    );
                    process.exit(1);
                });
            break;

        case "list":
            cleaner.listModels();
            process.exit(0);
            break;

        default:
            console.log("🧹 Models Cleaner");
            console.log("Usage:");
            console.log("  npm run models:clean all       - Delete all model files");
            console.log(
                "  npm run models:clean model <name> - Delete specific model file"
            );
            console.log("  npm run models:clean list      - List all model files");
            console.log("");
            console.log("Examples:");
            console.log("  npm run models:clean all");
            console.log("  npm run models:clean model User");
            console.log("  npm run models:clean list");
            process.exit(0);
    }
}

module.exports = ModelsCleaner;
