const express = require("express");
const ExportController = require("../controllers/ExportController");
const router = express.Router();

// Initialize controller
const exportController = new ExportController();

/**
 * Export Routes
 * All routes handle Excel export operations with streaming for large datasets
 */

// Pre-built export endpoints for common entities
router.get("/users", exportController.exportUsers.bind(exportController));
router.get("/products", exportController.exportProducts.bind(exportController));
router.get("/orders", exportController.exportOrders.bind(exportController));

// Dynamic export endpoints
router.post("/custom", exportController.exportCustomData.bind(exportController));
router.post("/report", exportController.exportReport.bind(exportController));
router.post("/query", exportController.exportWithQuery.bind(exportController));

// Buffer creation for async exports
router.post("/buffer", exportController.createExportBuffer.bind(exportController));

module.exports = router;
