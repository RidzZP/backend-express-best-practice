const express = require("express");
const router = express.Router();

// Import version routes
const v1Routes = require("./v1");
const v2Routes = require("./v2");

// Version routing
router.use(process.env.API_VERSION_1 || "/v1", v1Routes);
router.use(process.env.API_VERSION_2 || "/v2", v2Routes);

// Default route
router.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Express MVC API Server",
        version: "1.0.0",
        availableVersions: [
            `${process.env.API_PREFIX || "/api"}${process.env.API_VERSION_1 || "/v1"}`,
            `${process.env.API_PREFIX || "/api"}${process.env.API_VERSION_2 || "/v2"}`,
        ],
        applications: [
            `${process.env.APP_1_PREFIX || "/dashboard1"}`,
            `${process.env.APP_2_PREFIX || "/dashboard2"}`,
        ],
    });
});

module.exports = router;
