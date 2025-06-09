const express = require("express");
const ProductController = require("../../../controllers/ProductController");
const { transactionManager } = require("../../../middlewares/transactionMiddleware");
const { productImageUpload } = require("../../../middlewares/uploadMiddleware");

const router = express.Router();
const productController = new ProductController();

// Apply transaction middleware to all routes (will skip GET requests automatically)
router.use(transactionManager);

// Enhanced read-only routes for v2 (no transactions needed)
router.get("/", productController.getAll);
router.get("/analytics/statistics", productController.getStatistics);
router.get("/metadata/categories", productController.getCategories);
router.get("/search/:term", productController.search);
router.get("/filter/category/:category", productController.getByCategory);
router.get("/filter/price-range", productController.getByPriceRange);
router.get("/:id", productController.getById);

// Enhanced transactional routes for v2 (create, update, delete operations)
router.post("/", productImageUpload.single, productController.create);
router.post("/bulk-import", productController.bulkCreate);

// Routes with image upload
router.post("/with-image", productImageUpload.single, productController.createWithImage);
router.put(
    "/:id/with-image",
    productImageUpload.single,
    productController.updateWithImage
);

router.put("/:id", productImageUpload.single, productController.update);
router.patch("/:id", productImageUpload.single, productController.update);
router.delete("/:id", productController.delete);

// Advanced batch operations with transaction support (v2 enhanced)
router.patch("/operations/batch-update", productController.batchUpdate);
router.delete("/operations/batch-delete", productController.batchDelete);

// Category management with transaction support (v2 enhanced)
router.patch("/operations/transfer-category", productController.transferCategory);

module.exports = router;
