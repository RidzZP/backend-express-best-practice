const express = require("express");
const router = express.Router();

// Import route modules for dashboard2
const productsRoutes = require("./products");
// const ordersRoutes = require('./orders');

// Route modules
router.use("/products", productsRoutes);
// router.use('/orders', ordersRoutes);

// Dashboard2 info route
router.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Dashboard 2 API - Version 1",
        application: "dashboard2",
        version: "1.0.0",
        endpoints: [
            "GET /products",
            "POST /products",
            "GET /products/:id",
            "PUT /products/:id",
            "DELETE /products/:id",
            "GET /products/categories",
            "GET /products/statistics",
            "GET /products/search/:term",
            "GET /products/category/:category",
            "GET /products/price-range",
            "POST /products/bulk",
            // 'GET /orders',
            // Add other endpoints here
        ],
    });
});

module.exports = router;
