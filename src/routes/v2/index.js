const express = require("express");
const router = express.Router();

// Import application routes
const dashboard1Routes = require("./dashboard1");
const dashboard2Routes = require("./dashboard2");

// Application routing
router.use(process.env.APP_1_PREFIX || "/dashboard1", dashboard1Routes);
router.use(process.env.APP_2_PREFIX || "/dashboard2", dashboard2Routes);

// Version info route
router.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "API Version 2",
        version: "2.0.0",
        applications: [
            `${process.env.APP_1_PREFIX || "/dashboard1"}`,
            `${process.env.APP_2_PREFIX || "/dashboard2"}`,
        ],
    });
});

module.exports = router;
