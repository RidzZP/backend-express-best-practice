const jwt = require("jsonwebtoken");
const { Users } = require("../models");

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                status: "error",
                message: "Token tidak ditemukan. Akses ditolak.",
                data: null,
            });
        }

        // Extract token
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        if (!token) {
            return res.status(401).json({
                status: "error",
                message: "Token tidak valid. Akses ditolak.",
                data: null,
            });
        }

        // Verify token
        const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if user still exists
        const user = await Users.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "User tidak ditemukan. Token tidak valid.",
                data: null,
            });
        }

        // Add user info to request
        req.user = {
            id: user.id_user,
            email: user.email,
            name: user.name,
        };

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                status: "error",
                message: "Token tidak valid.",
                data: null,
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                status: "error",
                message: "Token sudah kedaluwarsa. Silakan login kembali.",
                data: null,
            });
        }

        return res.status(500).json({
            status: "error",
            message: "Terjadi kesalahan server saat memverifikasi token.",
            data: null,
        });
    }
};

// Optional auth middleware - doesn't require authentication but adds user info if token is present
const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.substring(7);

            if (token) {
                const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
                const decoded = jwt.verify(token, JWT_SECRET);

                const user = await Users.findByPk(decoded.id);

                if (user) {
                    req.user = {
                        id: user.id_user,
                        email: user.email,
                        name: user.name,
                    };
                }
            }
        }

        next();
    } catch (error) {
        // If token is invalid, just continue without user info
        next();
    }
};

module.exports = {
    authMiddleware,
    optionalAuthMiddleware,
};
