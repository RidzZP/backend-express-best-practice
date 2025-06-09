const express = require("express");
const router = express.Router();

// Import route modules for dashboard1
// const usersRoutes = require('./users');
const authRoutes = require("./auth");

// Route modules
// router.use('/users', usersRoutes);
router.use("/auth", authRoutes);

// Dashboard1 info route
router.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Dashboard 1 API - Version 1",
        application: "dashboard1",
        version: "1.0.0",
        endpoints: [
            // 'GET /users',
            "POST /auth/login",
            "POST /auth/register",
            "POST /auth/logout",
            "GET /auth/profile",
            // Add other endpoints here
        ],
    });
});

module.exports = router;
