const express = require("express");
const ProductController = require("../../../controllers/ProductController");
const { transactionManager } = require("../../../middlewares/transactionMiddleware");
const {
    authMiddleware,
    optionalAuthMiddleware,
} = require("../../../middlewares/authMiddleware");
const { productImageUpload } = require("../../../middlewares/uploadMiddleware");

const router = express.Router();
const productController = new ProductController();

// Apply transaction middleware to all routes (will skip GET requests automatically)
router.use(transactionManager);

// Read-only routes (no authentication required, but add user info if available)
router.get("/", optionalAuthMiddleware, productController.getAll);
router.get("/statistics", optionalAuthMiddleware, productController.getStatistics);
router.get("/categories", optionalAuthMiddleware, productController.getCategories);
router.get("/search/:term", optionalAuthMiddleware, productController.search);
router.get(
    "/category/:category",
    optionalAuthMiddleware,
    productController.getByCategory
);
router.get("/price-range", optionalAuthMiddleware, productController.getByPriceRange);
router.get("/:id", optionalAuthMiddleware, productController.getById);

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
