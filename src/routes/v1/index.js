const express = require("express");
const router = express.Router();

// Import application routes
const dashboard1Routes = require("./dashboard1");
const dashboard2Routes = require("./dashboard2");
const exportRoutes = require("../exportRoutes");

// Application routing
router.use(process.env.APP_1_PREFIX || "/dashboard1", dashboard1Routes);
router.use(process.env.APP_2_PREFIX || "/dashboard2", dashboard2Routes);

// Export routes
router.use("/export", exportRoutes);

// Version info route
router.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "API Version 1",
        version: "1.0.0",
        applications: [
            `${process.env.APP_1_PREFIX || "/dashboard1"}`,
            `${process.env.APP_2_PREFIX || "/dashboard2"}`,
        ],
        exports: [
            "/export/users",
            "/export/products",
            "/export/orders",
            "/export/custom",
            "/export/report",
            "/export/query",
            "/export/buffer",
        ],
    });
});

module.exports = router;
