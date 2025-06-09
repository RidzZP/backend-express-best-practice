const { ExcelExporter, DataSourceHelpers } = require("../utils/excelExporter");
const logger = require("../utils/logger");

/**
 * Excel Service for handling various export operations
 */
class ExcelService {
    constructor() {
        this.exporter = new ExcelExporter();
    }

    /**
     * Export users data to Excel
     * @param {Object} UserModel - Sequelize User model
     * @param {Object} filters - Filter conditions
     * @param {Object} res - Express response object
     */
    async exportUsers(UserModel, filters = {}, res) {
        try {
            const columns = [
                { header: "ID", key: "id", width: 10 },
                { header: "Name", key: "name", width: 20 },
                { header: "Email", key: "email", width: 30 },
                { header: "Phone", key: "phone", width: 15 },
                { header: "Status", key: "status", width: 15 },
                { header: "Created At", key: "createdAt", width: 20 },
                { header: "Updated At", key: "updatedAt", width: 20 },
            ];

            // Create data source with pagination for large datasets
            const dataSource = DataSourceHelpers.createSequelizeIterator(
                UserModel,
                { where: filters },
                1000 // Process 1000 records at a time
            );

            // Data transformation function
            const dataTransform = (user) => ({
                id: user.id,
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                status: user.status || "inactive",
                createdAt: user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "",
                updatedAt: user.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString()
                    : "",
            });

            const config = {
                data: dataSource,
                columns,
                filename: `users_export_${new Date().toISOString().split("T")[0]}.xlsx`,
                dataTransform,
                sheetOptions: { name: "Users" },
            };

            await this.exporter.exportToResponse(config, res);
            logger.info("Users exported successfully");
        } catch (error) {
            logger.error("Error exporting users:", error);
            throw error;
        }
    }

    /**
     * Export products data to Excel
     * @param {Object} ProductModel - Sequelize Product model
     * @param {Object} filters - Filter conditions
     * @param {Object} res - Express response object
     */
    async exportProducts(ProductModel, filters = {}, res) {
        try {
            const columns = [
                { header: "ID", key: "id", width: 10 },
                { header: "Name", key: "name", width: 30 },
                { header: "SKU", key: "sku", width: 20 },
                { header: "Price", key: "price", width: 15 },
                { header: "Stock", key: "stock", width: 15 },
                { header: "Category", key: "category", width: 20 },
                { header: "Status", key: "status", width: 15 },
                { header: "Created At", key: "createdAt", width: 20 },
            ];

            // Create data source with pagination
            const dataSource = DataSourceHelpers.createSequelizeIterator(
                ProductModel,
                {
                    where: filters,
                    include: [{ association: "category", attributes: ["name"] }],
                },
                1000
            );

            // Data transformation function
            const dataTransform = (product) => ({
                id: product.id,
                name: product.name || "",
                sku: product.sku || "",
                price: product.price
                    ? `$${parseFloat(product.price).toFixed(2)}`
                    : "$0.00",
                stock: product.stock || 0,
                category: product["category.name"] || "",
                status: product.status || "inactive",
                createdAt: product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString()
                    : "",
            });

            const config = {
                data: dataSource,
                columns,
                filename: `products_export_${
                    new Date().toISOString().split("T")[0]
                }.xlsx`,
                dataTransform,
                sheetOptions: { name: "Products" },
            };

            await this.exporter.exportToResponse(config, res);
            logger.info("Products exported successfully");
        } catch (error) {
            logger.error("Error exporting products:", error);
            throw error;
        }
    }

    /**
     * Export orders data to Excel with multiple sheets
     * @param {Object} OrderModel - Sequelize Order model
     * @param {Object} filters - Filter conditions
     * @param {Object} res - Express response object
     */
    async exportOrders(OrderModel, filters = {}, res) {
        try {
            const columns = [
                { header: "Order ID", key: "id", width: 15 },
                { header: "Order Number", key: "orderNumber", width: 20 },
                { header: "Customer Name", key: "customerName", width: 25 },
                { header: "Customer Email", key: "customerEmail", width: 30 },
                { header: "Total Amount", key: "totalAmount", width: 15 },
                { header: "Status", key: "status", width: 15 },
                { header: "Payment Status", key: "paymentStatus", width: 15 },
                { header: "Order Date", key: "orderDate", width: 20 },
                { header: "Shipping Address", key: "shippingAddress", width: 40 },
            ];

            // Create data source with joins
            const dataSource = DataSourceHelpers.createSequelizeIterator(
                OrderModel,
                {
                    where: filters,
                    include: [
                        { association: "customer", attributes: ["name", "email"] },
                        { association: "items" },
                    ],
                },
                500 // Smaller batch size due to joins
            );

            // Data transformation function
            const dataTransform = (order) => ({
                id: order.id,
                orderNumber: order.orderNumber || "",
                customerName: order["customer.name"] || "",
                customerEmail: order["customer.email"] || "",
                totalAmount: order.totalAmount
                    ? `$${parseFloat(order.totalAmount).toFixed(2)}`
                    : "$0.00",
                status: order.status || "pending",
                paymentStatus: order.paymentStatus || "unpaid",
                orderDate: order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "",
                shippingAddress: order.shippingAddress || "",
            });

            const config = {
                data: dataSource,
                columns,
                filename: `orders_export_${new Date().toISOString().split("T")[0]}.xlsx`,
                dataTransform,
                sheetOptions: { name: "Orders" },
            };

            await this.exporter.exportToResponse(config, res);
            logger.info("Orders exported successfully");
        } catch (error) {
            logger.error("Error exporting orders:", error);
            throw error;
        }
    }

    /**
     * Export custom data with custom configuration
     * @param {Object} config - Export configuration
     * @param {Object} res - Express response object
     */
    async exportCustomData(config, res) {
        try {
            await this.exporter.exportToResponse(config, res);
            logger.info(`Custom export completed: ${config.filename}`);
        } catch (error) {
            logger.error("Error in custom export:", error);
            throw error;
        }
    }

    /**
     * Create Excel file buffer for download/storage
     * @param {Object} config - Export configuration
     * @returns {Promise<Buffer>} Excel file buffer
     */
    async createExcelBuffer(config) {
        try {
            const buffer = await this.exporter.exportToBuffer(config);
            logger.info(`Excel buffer created: ${config.filename}`);
            return buffer;
        } catch (error) {
            logger.error("Error creating Excel buffer:", error);
            throw error;
        }
    }

    /**
     * Export data with custom query function
     * @param {Function} queryFunction - Function that returns data
     * @param {Array} columns - Column definitions
     * @param {string} filename - Output filename
     * @param {Object} res - Express response object
     * @param {Object} options - Additional options
     */
    async exportWithCustomQuery(queryFunction, columns, filename, res, options = {}) {
        try {
            // Create data source from custom query
            const dataSource = DataSourceHelpers.createDatabaseIterator(
                queryFunction,
                1000
            );

            const config = {
                data: dataSource,
                columns,
                filename,
                dataTransform: options.dataTransform,
                sheetOptions: options.sheetOptions || { name: "Data" },
            };

            await this.exporter.exportToResponse(config, res);
            logger.info(`Custom query export completed: ${filename}`);
        } catch (error) {
            logger.error("Error in custom query export:", error);
            throw error;
        }
    }

    /**
     * Export report with aggregated data
     * @param {Object} model - Sequelize model
     * @param {Object} aggregateConfig - Aggregation configuration
     * @param {Object} res - Express response object
     */
    async exportAggregatedReport(model, aggregateConfig, res) {
        try {
            const { groupBy, columns, filters = {}, filename } = aggregateConfig;

            // Custom query function for aggregated data
            const queryFunction = async (offset, limit) => {
                return await model.findAll({
                    where: filters,
                    group: groupBy,
                    attributes: columns.map((col) => col.key),
                    offset,
                    limit,
                    raw: true,
                });
            };

            await this.exportWithCustomQuery(
                queryFunction,
                columns,
                filename ||
                    `aggregated_report_${new Date().toISOString().split("T")[0]}.xlsx`,
                res,
                { sheetOptions: { name: "Report" } }
            );

            logger.info("Aggregated report exported successfully");
        } catch (error) {
            logger.error("Error exporting aggregated report:", error);
            throw error;
        }
    }
}

module.exports = ExcelService;
