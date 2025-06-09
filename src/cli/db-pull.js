#!/usr/bin/env node

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { getRawConnection } = require("../config/database");
const logger = require("../utils/logger");

// MySQL to Sequelize data type mapping
const TYPE_MAPPING = {
    tinyint: "DataTypes.TINYINT",
    smallint: "DataTypes.SMALLINT",
    mediumint: "DataTypes.MEDIUMINT",
    int: "DataTypes.INTEGER",
    integer: "DataTypes.INTEGER",
    bigint: "DataTypes.BIGINT",
    decimal: "DataTypes.DECIMAL",
    numeric: "DataTypes.DECIMAL",
    float: "DataTypes.FLOAT",
    double: "DataTypes.DOUBLE",
    bit: "DataTypes.BOOLEAN",
    char: "DataTypes.CHAR",
    varchar: "DataTypes.STRING",
    binary: "DataTypes.STRING.BINARY",
    varbinary: "DataTypes.STRING.BINARY",
    tinytext: 'DataTypes.TEXT("tiny")',
    text: "DataTypes.TEXT",
    mediumtext: 'DataTypes.TEXT("medium")',
    longtext: 'DataTypes.TEXT("long")',
    enum: "DataTypes.ENUM",
    set: "DataTypes.STRING",
    date: "DataTypes.DATEONLY",
    time: "DataTypes.TIME",
    datetime: "DataTypes.DATE",
    timestamp: "DataTypes.DATE",
    year: "DataTypes.INTEGER",
    json: "DataTypes.JSON",
    geometry: "DataTypes.GEOMETRY",
    point: 'DataTypes.GEOMETRY("POINT")',
    linestring: 'DataTypes.GEOMETRY("LINESTRING")',
    polygon: 'DataTypes.GEOMETRY("POLYGON")',
    multipoint: 'DataTypes.GEOMETRY("MULTIPOINT")',
    multilinestring: 'DataTypes.GEOMETRY("MULTILINESTRING")',
    multipolygon: 'DataTypes.GEOMETRY("MULTIPOLYGON")',
    geometrycollection: 'DataTypes.GEOMETRY("GEOMETRYCOLLECTION")',
};

class DatabasePuller {
    constructor() {
        this.connection = null;
        this.modelsDir = path.join(__dirname, "../models");
    }

    async connect() {
        try {
            this.connection = await getRawConnection();
            logger.info("Connected to database for table introspection");
        } catch (error) {
            logger.error("Failed to connect to database:", error);
            throw error;
        }
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.end();
            logger.info("Database connection closed");
        }
    }

    async getTables() {
        const [tables] = await this.connection.execute("SHOW TABLES");
        return tables.map((table) => Object.values(table)[0]);
    }

    async getTableSchema(tableName) {
        const [columns] = await this.connection.execute(`DESCRIBE ${tableName}`);

        const [indexes] = await this.connection.execute(`SHOW INDEX FROM ${tableName}`);

        const [foreignKeys] = await this.connection.execute(
            `
      SELECT 
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME,
        CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE REFERENCED_TABLE_SCHEMA = ? 
        AND TABLE_NAME = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `,
            [process.env.DB_NAME, tableName]
        );

        return { columns, indexes, foreignKeys };
    }

    parseDataType(columnType, isNullable, defaultValue, extra) {
        let type = columnType.toLowerCase();
        let length = "";
        let unsigned = "";
        let values = "";

        // Extract length, unsigned, and enum/set values
        const lengthMatch = type.match(/\(([^)]+)\)/);
        if (lengthMatch) {
            const param = lengthMatch[1];

            if (type.includes("enum") || type.includes("set")) {
                values = param;
            } else {
                length = param;
            }

            type = type.replace(/\([^)]+\)/, "");
        }

        if (type.includes("unsigned")) {
            unsigned = ".UNSIGNED";
            type = type.replace(" unsigned", "");
        }

        // Map to Sequelize type
        let sequelizeType = TYPE_MAPPING[type] || "DataTypes.STRING";

        // Add length or enum values
        if (length && !["text", "json"].includes(type)) {
            if (type.includes("decimal") || type.includes("numeric")) {
                sequelizeType = `DataTypes.DECIMAL(${length})`;
            } else if (type.includes("char") || type.includes("varchar")) {
                sequelizeType = `DataTypes.STRING(${length})`;
            }
        }

        if (values && (type.includes("enum") || type.includes("set"))) {
            sequelizeType = `DataTypes.ENUM(${values})`;
        }

        sequelizeType += unsigned;

        const options = [];

        // Add allowNull
        options.push(`allowNull: ${isNullable === "YES"}`);

        // Add primaryKey for auto increment
        if (extra && extra.includes("auto_increment")) {
            options.push("primaryKey: true");
            options.push("autoIncrement: true");
        }

        // Add default value
        if (
            defaultValue !== null &&
            defaultValue !== undefined &&
            defaultValue !== "NULL"
        ) {
            if (defaultValue === "CURRENT_TIMESTAMP") {
                options.push("defaultValue: DataTypes.NOW");
            } else if (typeof defaultValue === "string" && !defaultValue.includes("()")) {
                options.push(`defaultValue: '${defaultValue}'`);
            } else if (typeof defaultValue === "number") {
                options.push(`defaultValue: ${defaultValue}`);
            }
        }

        return {
            type: sequelizeType,
            options: options.join(", "),
        };
    }

    generateModelContent(tableName, schema) {
        const { columns, indexes, foreignKeys } = schema;
        const modelName = this.toPascalCase(tableName);

        let modelContent = `'use strict';\n\nmodule.exports = (sequelize, DataTypes) => {\n`;
        modelContent += `  const ${modelName} = sequelize.define('${modelName}', {\n`;

        // Generate columns
        columns.forEach((column, index) => {
            const { Field, Type, Null, Key, Default, Extra } = column;

            // Skip auto-generated id if it's auto increment primary key
            if (
                Field.toLowerCase() === "id" &&
                Key === "PRI" &&
                Extra.includes("auto_increment")
            ) {
                return;
            }

            const { type, options } = this.parseDataType(Type, Null, Default, Extra);

            modelContent += `    ${Field}: {\n`;
            modelContent += `      type: ${type}`;

            if (options) {
                modelContent += `,\n      ${options}`;
            }

            modelContent += `\n    }`;

            if (index < columns.length - 1) {
                modelContent += ",";
            }

            modelContent += "\n";
        });

        modelContent += `  }, {\n`;
        modelContent += `    tableName: '${tableName}',\n`;
        modelContent += `    timestamps: ${this.hasTimestamps(columns)},\n`;

        if (this.hasTimestamps(columns)) {
            const createdAt = this.findTimestampColumn(columns, [
                "created_at",
                "createdAt",
            ]);
            const updatedAt = this.findTimestampColumn(columns, [
                "updated_at",
                "updatedAt",
            ]);

            if (createdAt && createdAt !== "createdAt") {
                modelContent += `    createdAt: '${createdAt}',\n`;
            }
            if (updatedAt && updatedAt !== "updatedAt") {
                modelContent += `    updatedAt: '${updatedAt}',\n`;
            }
        }

        modelContent += `    underscored: false,\n`;
        modelContent += `    freezeTableName: true\n`;
        modelContent += `  });\n\n`;

        // Add associations if foreign keys exist
        if (foreignKeys.length > 0) {
            modelContent += `  ${modelName}.associate = function(models) {\n`;
            foreignKeys.forEach((fk) => {
                const referencedModel = this.toPascalCase(fk.REFERENCED_TABLE_NAME);
                modelContent += `    // ${modelName}.belongsTo(models.${referencedModel}, {\n`;
                modelContent += `    //   foreignKey: '${fk.COLUMN_NAME}',\n`;
                modelContent += `    //   as: '${fk.REFERENCED_TABLE_NAME}'\n`;
                modelContent += `    // });\n`;
            });
            modelContent += `  };\n\n`;
        }

        modelContent += `  return ${modelName};\n`;
        modelContent += `};`;

        return modelContent;
    }

    toPascalCase(str) {
        return str.replace(/(^|_)([a-z])/g, (match, prefix, letter) =>
            letter.toUpperCase()
        );
    }

    hasTimestamps(columns) {
        const timestampFields = ["created_at", "updated_at", "createdAt", "updatedAt"];
        return columns.some((col) => timestampFields.includes(col.Field));
    }

    findTimestampColumn(columns, possibleNames) {
        const found = columns.find((col) => possibleNames.includes(col.Field));
        return found ? found.Field : null;
    }

    async pullTables() {
        try {
            await this.connect();

            const tables = await this.getTables();
            logger.info(`Found ${tables.length} tables: ${tables.join(", ")}`);

            for (const tableName of tables) {
                logger.info(`Processing table: ${tableName}`);

                const schema = await this.getTableSchema(tableName);
                const modelContent = this.generateModelContent(tableName, schema);

                const modelName = this.toPascalCase(tableName);
                const fileName = `${modelName}.js`;
                const filePath = path.join(this.modelsDir, fileName);

                fs.writeFileSync(filePath, modelContent);
                logger.info(`Generated model: ${fileName}`);
            }

            logger.info("Database pull completed successfully");
        } catch (error) {
            logger.error("Error during database pull:", error);
            throw error;
        } finally {
            await this.disconnect();
        }
    }
}

// Execute if run directly
if (require.main === module) {
    const puller = new DatabasePuller();

    puller
        .pullTables()
        .then(() => {
            console.log("✅ Database tables pulled successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Failed to pull database tables:", error.message);
            process.exit(1);
        });
}

module.exports = DatabasePuller;
