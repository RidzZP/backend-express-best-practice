const express = require("express");
const router = express.Router();

// Import route modules for dashboard2 v2
const productsRoutes = require("./products");
// const ordersRoutes = require('./orders');

// Route modules
router.use("/products", productsRoutes);
// router.use('/orders', ordersRoutes);

// Dashboard2 v2 info route
router.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Dashboard 2 API - Version 2",
        application: "dashboard2",
        version: "2.0.0",
        endpoints: [
            "GET /products",
            "POST /products",
            "GET /products/:id",
            "PUT /products/:id",
            "DELETE /products/:id",
            "GET /products/metadata/categories",
            "GET /products/analytics/statistics",
            "GET /products/search/:term",
            "GET /products/filter/category/:category",
            "GET /products/filter/price-range",
            "POST /products/bulk-import",
            // 'GET /orders',
            // Add other endpoints here
        ],
    });
});

module.exports = router;
