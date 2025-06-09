const BaseController = require("./BaseController");
const ProductService = require("../services/ProductService");
const { asyncHandler } = require("../middlewares/errorHandler");
const { withTransaction } = require("../middlewares/transactionMiddleware");
const { deleteUploadedFile } = require("../middlewares/uploadMiddleware");
const path = require("path");
const logger = require("../utils/logger");

class ProductController extends BaseController {
    constructor() {
        super(new ProductService());
    }

    getAll = asyncHandler(async (req, res) => {
        const {
            page = 1,
            limit = 10,
            category,
            search,
            minPrice,
            maxPrice,
            sortBy = "date_added",
            sortOrder = "DESC",
            ...filters
        } = req.query;

        let options = {
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, sortOrder.toUpperCase()]],
        };

        let records;
        let total = 0;

        // Handle different search scenarios
        if (search) {
            records = await this.service.searchByName(search, options);
            total = await this.service.model.count({
                where: {
                    name: { [require("sequelize").Op.like]: `%${search}%` },
                },
            });
        } else if (category) {
            records = await this.service.findByCategory(category, options);
            total = await this.service.model.count({
                where: { category_name: category },
            });
        } else if (minPrice || maxPrice) {
            records = await this.service.findByPriceRange(
                minPrice ? parseFloat(minPrice) : undefined,
                maxPrice ? parseFloat(maxPrice) : undefined,
                options
            );

            const where = {};
            if (minPrice)
                where.price = { [require("sequelize").Op.gte]: parseFloat(minPrice) };
            if (maxPrice)
                where.price = {
                    ...where.price,
                    [require("sequelize").Op.lte]: parseFloat(maxPrice),
                };

            total = await this.service.model.count({ where });
        } else {
            // Use filters if provided
            if (Object.keys(filters).length > 0) {
                options.where = filters;
            }

            records = await this.service.findAll(options);
            total = await this.service.count(
                options.where ? { where: options.where } : {}
            );
        }

        res.status(200).json({
            status: "success",
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
            data: records,
        });
    });

    // Get product by ID (using custom primary key)
    getById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const record = await this.service.findByPk(id);

        res.status(200).json({
            status: "success",
            data: record,
        });
    });

    // Get products by category
    getByCategory = asyncHandler(async (req, res) => {
        const { category } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const options = {
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [["name", "ASC"]],
        };

        const records = await this.service.findByCategory(category, options);
        const total = await this.service.model.count({
            where: { category_name: category },
        });

        res.status(200).json({
            status: "success",
            data: records,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    });

    // Search products
    search = asyncHandler(async (req, res) => {
        const { term } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const options = {
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [["name", "ASC"]],
        };

        const records = await this.service.searchByName(term, options);
        const total = await this.service.model.count({
            where: {
                name: { [require("sequelize").Op.like]: `%${term}%` },
            },
        });

        res.status(200).json({
            status: "success",
            data: records,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    });

    // Get products by price range
    getByPriceRange = asyncHandler(async (req, res) => {
        const { minPrice, maxPrice } = req.query;

        if (!minPrice && !maxPrice) {
            return res.status(400).json({
                status: "error",
                message: "Please provide minPrice or maxPrice",
            });
        }

        const { page = 1, limit = 10 } = req.query;

        const options = {
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [["price", "ASC"]],
        };

        const records = await this.service.findByPriceRange(
            minPrice ? parseFloat(minPrice) : undefined,
            maxPrice ? parseFloat(maxPrice) : undefined,
            options
        );

        res.status(200).json({
            status: "success",
            data: records,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
            },
        });
    });

    // Get all categories
    getCategories = asyncHandler(async (req, res) => {
        const categories = await this.service.getCategories();

        res.status(200).json({
            status: "success",
            data: categories,
        });
    });

    // Get product statistics
    getStatistics = asyncHandler(async (req, res) => {
        const stats = await this.service.getStatistics();

        res.status(200).json({
            status: "success",
            data: stats,
        });
    });

    // Validate product data for create/update
    validateProductData = (data) => {
        const errors = [];

        if (!data.name || data.name.trim() === "") {
            errors.push("Product name is required");
        }

        if (!data.category_name || data.category_name.trim() === "") {
            errors.push("Category name is required");
        }

        if (!data.price || isNaN(parseFloat(data.price)) || parseFloat(data.price) <= 0) {
            errors.push("Valid price is required");
        }

        // Foto is optional, but if provided, validate it's a string
        if (data.foto && typeof data.foto !== "string") {
            errors.push("Photo path must be a valid string");
        }

        return errors;
    };

    // Override create with validation, transaction support, and image handling
    create = withTransaction(async (req, res) => {
        const errors = this.validateProductData(req.body);

        if (errors.length > 0) {
            // If validation fails and a file was uploaded, delete it
            if (req.file) {
                deleteUploadedFile(req.file.filename);
            }
            return res.status(400).json({
                status: "error",
                message: "Validation failed",
                errors,
            });
        }

        try {
            const record = await this.service.create(req.body, {
                transaction: req.transaction,
            });

            res.status(201).json({
                status: "success",
                message: "Product created successfully",
                data: record,
            });
        } catch (error) {
            logger.error("Error in create product:", error);

            // If database operation fails and a file was uploaded, delete it
            if (req.file) {
                deleteUploadedFile(req.file.filename);
            }

            if (error.statusCode) {
                return res.status(error.statusCode).json({
                    status: "error",
                    message: error.message,
                });
            }

            return res.status(500).json({
                status: "error",
                message: "Internal server error occurred while creating product",
            });
        }
    });

    // Override update with validation, transaction support, and image handling
    update = withTransaction(async (req, res) => {
        const errors = this.validateProductData(req.body);

        if (errors.length > 0) {
            // If validation fails and a file was uploaded, delete it
            if (req.file) {
                deleteUploadedFile(req.file.filename);
            }
            return res.status(400).json({
                status: "error",
                message: "Validation failed",
                errors,
            });
        }

        const { id } = req.params;

        try {
            // Get the current product to check if it has an existing image
            const currentProduct = await this.service.findByPk(id);
            const oldImagePath = currentProduct?.foto;

            const record = await this.service.update(id, req.body, {
                transaction: req.transaction,
            });

            // If update was successful and there's a new image, delete the old one
            if (req.body.foto && oldImagePath && oldImagePath !== req.body.foto) {
                const oldFilename = path.basename(oldImagePath);
                deleteUploadedFile(oldFilename);
            }

            res.status(200).json({
                status: "success",
                message: "Product updated successfully",
                data: record,
            });
        } catch (error) {
            logger.error("Error in update product:", error);

            // If database operation fails and a file was uploaded, delete it
            if (req.file) {
                deleteUploadedFile(req.file.filename);
            }

            if (error.statusCode) {
                return res.status(error.statusCode).json({
                    status: "error",
                    message: error.message,
                });
            }

            return res.status(500).json({
                status: "error",
                message: "Internal server error occurred while updating product",
            });
        }
    });

    // Override delete with transaction support and image cleanup
    delete = withTransaction(async (req, res) => {
        const { id } = req.params;

        try {
            // Get the product to check if it has an image
            const product = await this.service.findByPk(id);
            const imagePath = product?.foto;

            const result = await this.service.delete(id, {
                transaction: req.transaction,
            });

            // If deletion was successful and there's an image, delete it
            if (imagePath) {
                const filename = path.basename(imagePath);
                deleteUploadedFile(filename);
            }

            res.status(200).json({
                status: "success",
                message: "Product deleted successfully",
                data: result,
            });
        } catch (error) {
            // Handle specific error types and return appropriate responses
            logger.error("Error in delete product:", error);

            if (error.statusCode) {
                // This is an AppError with a specific status code
                return res.status(error.statusCode).json({
                    status: "error",
                    message: error.message,
                });
            }

            // For unexpected errors, return 500
            return res.status(500).json({
                status: "error",
                message: "Internal server error occurred while deleting product",
            });
        }
    });

    // Create product with image upload
    createWithImage = withTransaction(async (req, res) => {
        const errors = this.validateProductData(req.body);

        if (errors.length > 0) {
            // If validation fails and a file was uploaded, delete it
            if (req.file) {
                deleteUploadedFile(req.file.filename);
            }
            return res.status(400).json({
                status: "error",
                message: "Validation failed",
                errors,
            });
        }

        try {
            const record = await this.service.create(req.body, {
                transaction: req.transaction,
            });

            res.status(201).json({
                status: "success",
                message: "Product with image created successfully",
                data: record,
            });
        } catch (error) {
            logger.error("Error in create product with image:", error);

            // If database operation fails and a file was uploaded, delete it
            if (req.file) {
                deleteUploadedFile(req.file.filename);
            }

            if (error.statusCode) {
                return res.status(error.statusCode).json({
                    status: "error",
                    message: error.message,
                });
            }

            return res.status(500).json({
                status: "error",
                message: "Internal server error occurred while creating product",
            });
        }
    });

    // Update product with image upload
    updateWithImage = withTransaction(async (req, res) => {
        const errors = this.validateProductData(req.body);

        if (errors.length > 0) {
            // If validation fails and a file was uploaded, delete it
            if (req.file) {
                deleteUploadedFile(req.file.filename);
            }
            return res.status(400).json({
                status: "error",
                message: "Validation failed",
                errors,
            });
        }

        const { id } = req.params;

        try {
            // Get the current product to check if it has an existing image
            const currentProduct = await this.service.findByPk(id);
            const oldImagePath = currentProduct?.foto;

            const record = await this.service.update(id, req.body, {
                transaction: req.transaction,
            });

            // If update was successful and there's a new image, delete the old one
            if (req.body.foto && oldImagePath && oldImagePath !== req.body.foto) {
                const oldFilename = path.basename(oldImagePath);
                deleteUploadedFile(oldFilename);
            }

            res.status(200).json({
                status: "success",
                message: "Product with image updated successfully",
                data: record,
            });
        } catch (error) {
            logger.error("Error in update product with image:", error);

            // If database operation fails and a file was uploaded, delete it
            if (req.file) {
                deleteUploadedFile(req.file.filename);
            }

            if (error.statusCode) {
                return res.status(error.statusCode).json({
                    status: "error",
                    message: error.message,
                });
            }

            return res.status(500).json({
                status: "error",
                message: "Internal server error occurred while updating product",
            });
        }
    });

    // Bulk create products with transaction support
    bulkCreate = withTransaction(async (req, res) => {
        const { products } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "Products array is required",
            });
        }

        // Validate each product
        const validationErrors = [];
        products.forEach((product, index) => {
            const errors = this.validateProductData(product);
            if (errors.length > 0) {
                validationErrors.push({ index, errors });
            }
        });

        if (validationErrors.length > 0) {
            return res.status(400).json({
                status: "error",
                message: "Validation failed for some products",
                errors: validationErrors,
            });
        }

        try {
            // Add timestamps to all products
            const productsWithTimestamps = products.map((product) => ({
                ...product,
                date_added: new Date(),
                date_updated: new Date(),
            }));

            const records = await this.service.bulkCreate(productsWithTimestamps, {
                transaction: req.transaction,
            });

            res.status(201).json({
                status: "success",
                message: `${records.length} products created successfully`,
                data: records,
            });
        } catch (error) {
            logger.error("Error in bulk create products:", error);

            if (error.statusCode) {
                return res.status(error.statusCode).json({
                    status: "error",
                    message: error.message,
                });
            }

            return res.status(500).json({
                status: "error",
                message: "Internal server error occurred while creating products",
            });
        }
    });

    // Batch update products with transaction support
    batchUpdate = withTransaction(async (req, res) => {
        const { updates } = req.body;

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "Updates array is required",
            });
        }

        // Validate each update
        const validationErrors = [];
        updates.forEach((update, index) => {
            if (!update.id) {
                validationErrors.push({ index, errors: ["Product ID is required"] });
                return;
            }

            const errors = this.validateProductData(update.data);
            if (errors.length > 0) {
                validationErrors.push({ index, errors });
            }
        });

        if (validationErrors.length > 0) {
            return res.status(400).json({
                status: "error",
                message: "Validation failed for some updates",
                errors: validationErrors,
            });
        }

        try {
            const results = await this.service.batchUpdate(updates, {
                transaction: req.transaction,
            });

            res.status(200).json({
                status: "success",
                message: `${results.length} products updated successfully`,
                data: results,
            });
        } catch (error) {
            logger.error("Error in batch update products:", error);

            if (error.statusCode) {
                return res.status(error.statusCode).json({
                    status: "error",
                    message: error.message,
                });
            }

            return res.status(500).json({
                status: "error",
                message: "Internal server error occurred while updating products",
            });
        }
    });

    // Batch delete products with transaction support
    batchDelete = withTransaction(async (req, res) => {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "Product IDs array is required",
            });
        }

        try {
            const results = await this.service.batchDelete(ids, {
                transaction: req.transaction,
            });

            res.status(200).json({
                status: "success",
                message: `${results.length} products deleted successfully`,
                data: results,
            });
        } catch (error) {
            logger.error("Error in batch delete products:", error);

            if (error.statusCode) {
                return res.status(error.statusCode).json({
                    status: "error",
                    message: error.message,
                });
            }

            return res.status(500).json({
                status: "error",
                message: "Internal server error occurred while deleting products",
            });
        }
    });

    // Transfer products between categories with transaction support
    transferCategory = withTransaction(async (req, res) => {
        const { productIds, newCategory } = req.body;

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "Product IDs array is required",
            });
        }

        if (!newCategory || newCategory.trim() === "") {
            return res.status(400).json({
                status: "error",
                message: "New category name is required",
            });
        }

        try {
            const result = await this.service.transferCategory(
                productIds,
                newCategory.trim(),
                { transaction: req.transaction }
            );

            res.status(200).json({
                status: "success",
                message: result.message,
                data: result,
            });
        } catch (error) {
            logger.error("Error in transfer category:", error);

            if (error.statusCode) {
                return res.status(error.statusCode).json({
                    status: "error",
                    message: error.message,
                });
            }

            return res.status(500).json({
                status: "error",
                message: "Internal server error occurred while transferring category",
            });
        }
    });
}

module.exports = ProductController;
