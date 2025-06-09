const express = require("express");
const router = express.Router();

// Import route modules for dashboard1 v2
// const usersRoutes = require('./users');
// const authRoutes = require('./auth');

// Route modules
// router.use('/users', usersRoutes);
// router.use('/auth', authRoutes);

// Dashboard1 v2 info route
router.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Dashboard 1 API - Version 2",
        application: "dashboard1",
        version: "2.0.0",
        endpoints: [
            // 'GET /users',
            // 'POST /auth/login',
            // Add other endpoints here
        ],
    });
});

module.exports = router;
