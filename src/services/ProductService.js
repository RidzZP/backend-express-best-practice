const BaseService = require("./BaseService");
const { Product } = require("../models");
const { AppError } = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const { Op } = require("sequelize");
const { executeInTransaction } = require("../middlewares/transactionMiddleware");

class ProductService extends BaseService {
    constructor() {
        super(Product);
    }

    // Override findByPk to use custom primary key with transaction support
    async findByPk(id, options = {}) {
        try {
            logger.info(`Finding Product with ID: ${id}`);
            const record = await this.model.findOne({
                where: { id_product: id },
                ...options,
            });

            if (!record) {
                throw new AppError("Product not found", 404);
            }

            logger.info(`Product found with ID: ${id}`);
            return record;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error("Error finding Product:", error);
            throw new AppError("Failed to retrieve product", 500);
        }
    }

    // Override update to use custom primary key with transaction support
    async update(id, data, options = {}) {
        return await executeInTransaction(async (transaction) => {
            try {
                logger.info(`Updating Product with ID: ${id} in transaction`);

                const record = await this.findByPk(id, { transaction });

                // Add date_updated automatically
                const updateData = {
                    ...data,
                    date_updated: new Date(),
                };

                const updatedRecord = await record.update(updateData, {
                    transaction,
                    ...options,
                });

                logger.info(`Product updated with ID: ${id} in transaction`);
                return updatedRecord;
            } catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                logger.error("Error updating Product in transaction:", error);
                throw new AppError("Failed to update product", 500);
            }
        }, options.transaction);
    }

    // Override delete to use custom primary key with transaction support
    async delete(id, options = {}) {
        return await executeInTransaction(async (transaction) => {
            try {
                logger.info(`Deleting Product with ID: ${id} in transaction`);

                const record = await this.findByPk(id, { transaction });
                await record.destroy({
                    transaction,
                    ...options,
                });

                logger.info(`Product deleted with ID: ${id} in transaction`);
                return { message: "Product deleted successfully" };
            } catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                logger.error("Error deleting Product in transaction:", error);
                throw new AppError("Failed to delete product", 500);
            }
        }, options.transaction);
    }

    // Override create to add date_added and date_updated with transaction support
    async create(data, options = {}) {
        return await executeInTransaction(async (transaction) => {
            try {
                logger.info("Creating new Product in transaction");

                // Validate required fields
                if (!data.name) {
                    throw new AppError("Product name is required", 400);
                }
                if (!data.category_name) {
                    throw new AppError("Category name is required", 400);
                }
                if (!data.price || data.price <= 0) {
                    throw new AppError("Valid price is required", 400);
                }

                const createData = {
                    name: data.name,
                    category_name: data.category_name,
                    price: parseFloat(data.price),
                    date_added: new Date(),
                    date_updated: new Date(),
                };

                // Add foto if provided
                if (data.foto) {
                    createData.foto = data.foto;
                }

                logger.info("Creating product with data:", createData);

                const record = await this.model.create(createData, {
                    transaction,
                    ...options,
                });

                logger.info(
                    `Product created with ID: ${record.id_product} in transaction`
                );
                return record;
            } catch (error) {
                logger.error("Error creating Product in transaction:", error);

                // Provide more specific error messages
                if (error.name === "SequelizeValidationError") {
                    throw new AppError(`Validation error: ${error.message}`, 400);
                } else if (error.name === "SequelizeDatabaseError") {
                    logger.error("Database error details:", error.original);
                    throw new AppError("Database error occurred", 500);
                } else if (error.name === "SequelizeConnectionError") {
                    throw new AppError("Database connection error", 500);
                }

                throw new AppError("Failed to create product", 500);
            }
        }, options.transaction);
    }

    // Bulk create with transaction support for data integrity
    async bulkCreate(products, options = {}) {
        return await executeInTransaction(async (transaction) => {
            try {
                logger.info(`Creating ${products.length} products in transaction`);

                // Validate all products first
                const validatedProducts = products.map((product) => ({
                    ...product,
                    date_added: product.date_added || new Date(),
                    date_updated: product.date_updated || new Date(),
                }));

                const records = await this.model.bulkCreate(validatedProducts, {
                    transaction,
                    validate: true,
                    ...options,
                });

                logger.info(
                    `${records.length} products created successfully in transaction`
                );
                return records;
            } catch (error) {
                logger.error("Error in bulk create transaction:", error);
                throw new AppError("Failed to create products", 500);
            }
        }, options.transaction);
    }

    // Batch update with transaction support
    async batchUpdate(updates, options = {}) {
        return await executeInTransaction(async (transaction) => {
            try {
                logger.info(
                    `Performing batch update for ${updates.length} products in transaction`
                );

                const results = [];
                for (const update of updates) {
                    const { id, data } = update;
                    const record = await this.findByPk(id, { transaction });

                    const updateData = {
                        ...data,
                        date_updated: new Date(),
                    };

                    const updatedRecord = await record.update(updateData, {
                        transaction,
                    });
                    results.push(updatedRecord);
                }

                logger.info(
                    `Batch update completed for ${results.length} products in transaction`
                );
                return results;
            } catch (error) {
                logger.error("Error in batch update transaction:", error);
                throw new AppError("Failed to update products", 500);
            }
        }, options.transaction);
    }

    // Batch delete with transaction support
    async batchDelete(ids, options = {}) {
        return await executeInTransaction(async (transaction) => {
            try {
                logger.info(
                    `Performing batch delete for ${ids.length} products in transaction`
                );

                const results = [];
                for (const id of ids) {
                    const record = await this.findByPk(id, { transaction });
                    await record.destroy({ transaction });
                    results.push({ id, message: "Product deleted successfully" });
                }

                logger.info(
                    `Batch delete completed for ${results.length} products in transaction`
                );
                return results;
            } catch (error) {
                logger.error("Error in batch delete transaction:", error);
                throw new AppError("Failed to delete products", 500);
            }
        }, options.transaction);
    }

    // Transfer products between categories with transaction support
    async transferCategory(productIds, newCategory, options = {}) {
        return await executeInTransaction(async (transaction) => {
            try {
                logger.info(
                    `Transferring ${productIds.length} products to category: ${newCategory} in transaction`
                );

                const updateData = {
                    category_name: newCategory,
                    date_updated: new Date(),
                };

                const [affectedCount] = await this.model.update(updateData, {
                    where: {
                        id_product: {
                            [Op.in]: productIds,
                        },
                    },
                    transaction,
                    ...options,
                });

                logger.info(
                    `${affectedCount} products transferred to category: ${newCategory} in transaction`
                );
                return {
                    affectedCount,
                    newCategory,
                    message: `${affectedCount} products transferred successfully`,
                };
            } catch (error) {
                logger.error("Error in category transfer transaction:", error);
                throw new AppError("Failed to transfer products to new category", 500);
            }
        }, options.transaction);
    }

    // Find products by category
    async findByCategory(categoryName, options = {}) {
        try {
            logger.info(`Finding products by category: ${categoryName}`);

            const records = await this.model.findAll({
                where: { category_name: categoryName },
                ...options,
            });

            logger.info(`Found ${records.length} products in category: ${categoryName}`);
            return records;
        } catch (error) {
            logger.error("Error finding products by category:", error);
            throw new AppError("Failed to retrieve products by category", 500);
        }
    }

    // Search products by name
    async searchByName(searchTerm, options = {}) {
        try {
            logger.info(`Searching products with term: ${searchTerm}`);

            const records = await this.model.findAll({
                where: {
                    name: {
                        [Op.like]: `%${searchTerm}%`,
                    },
                },
                ...options,
            });

            logger.info(`Found ${records.length} products matching: ${searchTerm}`);
            return records;
        } catch (error) {
            logger.error("Error searching products:", error);
            throw new AppError("Failed to search products", 500);
        }
    }

    // Find products by price range
    async findByPriceRange(minPrice, maxPrice, options = {}) {
        try {
            logger.info(`Finding products in price range: ${minPrice} - ${maxPrice}`);

            const where = {};
            if (minPrice !== undefined) {
                where.price = { [Op.gte]: minPrice };
            }
            if (maxPrice !== undefined) {
                where.price = { ...where.price, [Op.lte]: maxPrice };
            }

            const records = await this.model.findAll({
                where,
                ...options,
            });

            logger.info(`Found ${records.length} products in price range`);
            return records;
        } catch (error) {
            logger.error("Error finding products by price range:", error);
            throw new AppError("Failed to retrieve products by price range", 500);
        }
    }

    // Get all categories
    async getCategories() {
        try {
            logger.info("Getting all product categories");

            const categories = await this.model.findAll({
                attributes: ["category_name"],
                group: ["category_name"],
                raw: true,
            });

            const categoryList = categories.map((cat) => cat.category_name);
            logger.info(`Found ${categoryList.length} categories`);
            return categoryList;
        } catch (error) {
            logger.error("Error getting categories:", error);
            throw new AppError("Failed to retrieve categories", 500);
        }
    }

    // Get product statistics
    async getStatistics() {
        try {
            logger.info("Getting product statistics");

            const [totalProducts, totalCategories, avgPrice, minPrice, maxPrice] =
                await Promise.all([
                    this.model.count(),
                    this.model.count({
                        distinct: true,
                        col: "category_name",
                    }),
                    this.model.aggregate("price", "avg"),
                    this.model.min("price"),
                    this.model.max("price"),
                ]);

            const stats = {
                totalProducts,
                totalCategories,
                avgPrice: parseFloat(avgPrice || 0).toFixed(2),
                minPrice: parseFloat(minPrice || 0).toFixed(2),
                maxPrice: parseFloat(maxPrice || 0).toFixed(2),
            };

            logger.info("Product statistics retrieved successfully");
            return stats;
        } catch (error) {
            logger.error("Error getting product statistics:", error);
            throw new AppError("Failed to retrieve product statistics", 500);
        }
    }
}

module.exports = ProductService;
