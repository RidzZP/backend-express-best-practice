const ExcelService = require("../services/ExcelService");
const logger = require("../utils/logger");

/**
 * Controller for handling Excel export operations
 */
class ExportController {
    constructor() {
        this.excelService = new ExcelService();
    }

    /**
     * Export users to Excel
     * GET /api/export/users
     */
    async exportUsers(req, res) {
        try {
            const { Users } = require("../models");
            const filters = this._buildFilters(req.query);

            await this.excelService.exportUsers(Users, filters, res);
        } catch (error) {
            logger.error("Error in exportUsers controller:", error);
            res.status(500).json({
                success: false,
                message: "Failed to export users",
                error: error.message,
            });
        }
    }

    /**
     * Export products to Excel
     * GET /api/export/products
     */
    async exportProducts(req, res) {
        try {
            const { Product } = require("../models");
            const filters = this._buildFilters(req.query);

            await this.excelService.exportProducts(Product, filters, res);
        } catch (error) {
            logger.error("Error in exportProducts controller:", error);
            res.status(500).json({
                success: false,
                message: "Failed to export products",
                error: error.message,
            });
        }
    }

    /**
     * Export orders to Excel
     * GET /api/export/orders
     */
    async exportOrders(req, res) {
        try {
            const { Order } = require("../models");
            const filters = this._buildFilters(req.query);

            await this.excelService.exportOrders(Order, filters, res);
        } catch (error) {
            logger.error("Error in exportOrders controller:", error);
            res.status(500).json({
                success: false,
                message: "Failed to export orders",
                error: error.message,
            });
        }
    }

    /**
     * Export custom data with dynamic configuration
     * POST /api/export/custom
     */
    async exportCustomData(req, res) {
        try {
            const { modelName, columns, filters, filename, sheetName } = req.body;

            // Validate required fields
            if (!modelName || !columns) {
                return res.status(400).json({
                    success: false,
                    message: "Model name and columns are required",
                });
            }

            const models = require("../models");
            const Model = models[modelName];

            if (!Model) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid model name",
                });
            }

            // Create data source
            const { DataSourceHelpers } = require("../utils/excelExporter");
            const dataSource = DataSourceHelpers.createSequelizeIterator(
                Model,
                { where: filters || {} },
                1000
            );

            const config = {
                data: dataSource,
                columns,
                filename:
                    filename ||
                    `${modelName.toLowerCase()}_export_${
                        new Date().toISOString().split("T")[0]
                    }.xlsx`,
                sheetOptions: { name: sheetName || modelName },
            };

            await this.excelService.exportCustomData(config, res);
        } catch (error) {
            logger.error("Error in exportCustomData controller:", error);
            res.status(500).json({
                success: false,
                message: "Failed to export custom data",
                error: error.message,
            });
        }
    }

    /**
     * Export aggregated report
     * POST /api/export/report
     */
    async exportReport(req, res) {
        try {
            const { modelName, groupBy, columns, filters, filename } = req.body;

            // Validate required fields
            if (!modelName || !groupBy || !columns) {
                return res.status(400).json({
                    success: false,
                    message: "Model name, groupBy, and columns are required",
                });
            }

            const models = require("../models");
            const Model = models[modelName];

            if (!Model) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid model name",
                });
            }

            const aggregateConfig = {
                groupBy,
                columns,
                filters: filters || {},
                filename:
                    filename ||
                    `${modelName.toLowerCase()}_report_${
                        new Date().toISOString().split("T")[0]
                    }.xlsx`,
            };

            await this.excelService.exportAggregatedReport(Model, aggregateConfig, res);
        } catch (error) {
            logger.error("Error in exportReport controller:", error);
            res.status(500).json({
                success: false,
                message: "Failed to export report",
                error: error.message,
            });
        }
    }

    /**
     * Export data with custom SQL query
     * POST /api/export/query
     */
    async exportWithQuery(req, res) {
        try {
            const { query, columns, filename, sheetName } = req.body;

            if (!query || !columns) {
                return res.status(400).json({
                    success: false,
                    message: "Query and columns are required",
                });
            }

            const { sequelize } = require("../models");

            // Custom query function
            const queryFunction = async (offset, limit) => {
                const queryWithPagination = `${query} LIMIT ${limit} OFFSET ${offset}`;
                const [results] = await sequelize.query(queryWithPagination);
                return results;
            };

            await this.excelService.exportWithCustomQuery(
                queryFunction,
                columns,
                filename || `query_export_${new Date().toISOString().split("T")[0]}.xlsx`,
                res,
                { sheetOptions: { name: sheetName || "Query Results" } }
            );
        } catch (error) {
            logger.error("Error in exportWithQuery controller:", error);
            res.status(500).json({
                success: false,
                message: "Failed to export query results",
                error: error.message,
            });
        }
    }

    /**
     * Get export status or create buffer for later download
     * POST /api/export/buffer
     */
    async createExportBuffer(req, res) {
        try {
            const { modelName, columns, filters, filename, sheetName } = req.body;

            if (!modelName || !columns) {
                return res.status(400).json({
                    success: false,
                    message: "Model name and columns are required",
                });
            }

            const models = require("../models");
            const Model = models[modelName];

            if (!Model) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid model name",
                });
            }

            // Create data source
            const { DataSourceHelpers } = require("../utils/excelExporter");
            const dataSource = DataSourceHelpers.createSequelizeIterator(
                Model,
                { where: filters || {} },
                1000
            );

            const config = {
                data: dataSource,
                columns,
                filename: filename || `${modelName.toLowerCase()}_export.xlsx`,
                sheetOptions: { name: sheetName || modelName },
            };

            const buffer = await this.excelService.createExcelBuffer(config);

            // Return buffer as base64 or save to temporary location
            res.json({
                success: true,
                message: "Export buffer created successfully",
                data: {
                    filename: config.filename,
                    size: buffer.length,
                    buffer: buffer.toString("base64"), // For small files
                },
            });
        } catch (error) {
            logger.error("Error in createExportBuffer controller:", error);
            res.status(500).json({
                success: false,
                message: "Failed to create export buffer",
                error: error.message,
            });
        }
    }

    /**
     * Build filters from query parameters
     * @param {Object} queryParams - Request query parameters
     * @returns {Object} Sequelize where conditions
     */
    _buildFilters(queryParams) {
        const filters = {};
        const { Op } = require("sequelize");

        // Common filter patterns
        Object.keys(queryParams).forEach((key) => {
            const value = queryParams[key];

            // Skip pagination and other non-filter params
            if (["page", "limit", "sort", "order"].includes(key)) {
                return;
            }

            // Handle different filter types
            if (key.endsWith("_like")) {
                const field = key.replace("_like", "");
                filters[field] = { [Op.like]: `%${value}%` };
            } else if (key.endsWith("_gt")) {
                const field = key.replace("_gt", "");
                filters[field] = { [Op.gt]: value };
            } else if (key.endsWith("_gte")) {
                const field = key.replace("_gte", "");
                filters[field] = { [Op.gte]: value };
            } else if (key.endsWith("_lt")) {
                const field = key.replace("_lt", "");
                filters[field] = { [Op.lt]: value };
            } else if (key.endsWith("_lte")) {
                const field = key.replace("_lte", "");
                filters[field] = { [Op.lte]: value };
            } else if (key.endsWith("_in")) {
                const field = key.replace("_in", "");
                filters[field] = { [Op.in]: value.split(",") };
            } else if (key.endsWith("_between")) {
                const field = key.replace("_between", "");
                const [start, end] = value.split(",");
                filters[field] = { [Op.between]: [start, end] };
            } else {
                // Direct equality
                filters[key] = value;
            }
        });

        return filters;
    }
}

module.exports = ExportController;
