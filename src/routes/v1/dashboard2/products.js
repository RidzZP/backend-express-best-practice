const express = require("express");
const ProductController = require("../../../controllers/ProductController");
const { transactionManager } = require("../../../middlewares/transactionMiddleware");
const {
    authMiddleware,
    optionalAuthMiddleware,
} = require("../../../middlewares/authMiddleware");
const { productImageUpload } = require("../../../middlewares/uploadMiddleware");
const {
    productCacheMiddleware,
    productCacheInvalidation,
} = require("../../../middlewares/cacheMiddleware");

const router = express.Router();
const productController = new ProductController();

// Apply transaction middleware to all routes (will skip GET requests automatically)
router.use(transactionManager);

// Apply cache invalidation middleware to all routes
router.use(productCacheInvalidation());

// Read-only routes (no authentication required, but add user info if available) with caching
router.get(
    "/",
    optionalAuthMiddleware,
    productCacheMiddleware(1800),
    productController.getAll
); // Cache for 30 minutes
router.get(
    "/statistics",
    optionalAuthMiddleware,
    productCacheMiddleware(1800),
    productController.getStatistics
); // Cache for 30 minutes
router.get(
    "/categories",
    optionalAuthMiddleware,
    productCacheMiddleware(3600),
    productController.getCategories
); // Cache for 1 hour
router.get(
    "/search/:term",
    optionalAuthMiddleware,
    productCacheMiddleware(600),
    productController.search
); // Cache for 10 minutes
router.get(
    "/category/:category",
    optionalAuthMiddleware,
    productCacheMiddleware(900), // Cache for 15 minutes
    productController.getByCategory
);
router.get(
    "/price-range",
    optionalAuthMiddleware,
    productCacheMiddleware(900),
    productController.getByPriceRange
); // Cache for 15 minutes
router.get(
    "/:id",
    optionalAuthMiddleware,
    productCacheMiddleware(1800),
    productController.getById
); // Cache for 30 minutes

// Transactional routes (create, update, delete operations) - Authentication required
router.post("/", productImageUpload.single, authMiddleware, productController.create);

// Routes with image upload
router.post(
    "/with-image",
    productImageUpload.single,
    authMiddleware,
    productController.createWithImage
);
router.put(
    "/:id/with-image",
    productImageUpload.single,
    authMiddleware,
    productController.updateWithImage
);

router.post("/bulk", authMiddleware, productController.bulkCreate);
router.put("/:id", productImageUpload.single, authMiddleware, productController.update);
router.patch("/:id", productImageUpload.single, authMiddleware, productController.update);
router.delete("/:id", authMiddleware, productController.delete);

// Batch operations with transaction support - Authentication required
router.patch("/batch/update", authMiddleware, productController.batchUpdate);
router.delete("/batch/delete", authMiddleware, productController.batchDelete);

// Category transfer with transaction support - Authentication required
router.patch("/transfer/category", authMiddleware, productController.transferCategory);

module.exports = router;
