const BaseController = require("./BaseController");
const { Users } = require("../models");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

class AuthController extends BaseController {
    constructor() {
        super();
        this.JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
        this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
    }

    // Helper method to hash password with SHA-1
    hashPassword(password) {
        return CryptoJS.SHA1(password).toString();
    }

    // Helper method to generate JWT token
    generateToken(user) {
        const payload = {
            id: user.id_user,
            email: user.email,
            name: user.name,
        };
        return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
    }

    sendResponse(res, statusCode, status, message, data) {
        res.status(statusCode).json({ status, message, data });
    }

    // Login method
    login = async (req, res) => {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
                return this.sendResponse(
                    res,
                    400,
                    "error",
                    "Email dan password wajib diisi",
                    null
                );
            }

            // Find user by email
            const user = await Users.findOne({
                where: { email: email },
            });

            if (!user) {
                return this.sendResponse(
                    res,
                    401,
                    "error",
                    "Email atau password salah",
                    null
                );
            }

            // Hash the provided password and compare
            const hashedPassword = this.hashPassword(password);
            if (hashedPassword !== user.password) {
                return this.sendResponse(
                    res,
                    401,
                    "error",
                    "Email atau password salah",
                    null
                );
            }

            // Generate JWT token
            const token = this.generateToken(user);

            // Remove password from response
            const userResponse = {
                id_user: user.id_user,
                name: user.name,
                email: user.email,
                date_added: user.date_added,
                date_updated: user.date_updated,
            };

            this.sendResponse(res, 200, "success", "Login berhasil", {
                user: userResponse,
                token: token,
                token_type: "Bearer",
                expires_in: this.JWT_EXPIRES_IN,
            });
        } catch (error) {
            console.error("Login error:", error);
            this.sendResponse(res, 500, "error", "Terjadi kesalahan server", null);
        }
    };

    // Logout method
    logout = async (req, res) => {
        try {
            // In a real application, you might want to blacklist the token
            // For now, we'll just send a success response
            this.sendResponse(res, 200, "success", "Logout berhasil", null);
        } catch (error) {
            console.error("Logout error:", error);
            this.sendResponse(res, 500, "error", "Terjadi kesalahan server", null);
        }
    };

    // Get current user profile
    profile = async (req, res) => {
        try {
            const userId = req.user.id;

            const user = await Users.findByPk(userId);

            if (!user) {
                return this.sendResponse(res, 404, "error", "User tidak ditemukan", null);
            }

            // Remove password from response
            const userResponse = {
                id_user: user.id_user,
                name: user.name,
                email: user.email,
                date_added: user.date_added,
                date_updated: user.date_updated,
            };

            this.sendResponse(res, 200, "success", "Profile user", userResponse);
        } catch (error) {
            console.error("Profile error:", error);
            this.sendResponse(res, 500, "error", "Terjadi kesalahan server", null);
        }
    };

    // Register method (optional - for creating users)
    register = async (req, res) => {
        try {
            const { name, email, password } = req.body;

            // Validate input
            if (!name || !email || !password) {
                return this.sendResponse(
                    res,
                    400,
                    "error",
                    "Nama, email, dan password wajib diisi",
                    null
                );
            }

            // Check if user already exists
            const existingUser = await Users.findOne({
                where: { email: email },
            });

            if (existingUser) {
                return this.sendResponse(
                    res,
                    409,
                    "error",
                    "Email sudah terdaftar",
                    null
                );
            }

            // Hash password
            const hashedPassword = this.hashPassword(password);

            // Create user
            const currentDate = new Date();
            const newUser = await Users.create({
                name: name,
                email: email,
                password: hashedPassword,
                date_added: currentDate,
                date_updated: currentDate,
            });

            // Generate JWT token
            const token = this.generateToken(newUser);

            // Remove password from response
            const userResponse = {
                id_user: newUser.id_user,
                name: newUser.name,
                email: newUser.email,
                date_added: newUser.date_added,
                date_updated: newUser.date_updated,
            };

            this.sendResponse(res, 201, "success", "Registrasi berhasil", {
                user: userResponse,
                token: token,
                token_type: "Bearer",
                expires_in: this.JWT_EXPIRES_IN,
            });
        } catch (error) {
            console.error("Register error:", error);
            this.sendResponse(res, 500, "error", "Terjadi kesalahan server", null);
        }
    };
}

module.exports = AuthController;
