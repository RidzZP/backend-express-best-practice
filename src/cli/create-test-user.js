const { Users } = require("../models");
const CryptoJS = require("crypto-js");

async function createTestUser() {
    try {
        console.log("Creating test user...");

        // Check if test user already exists
        const existingUser = await Users.findOne({
            where: { email: "test@example.com" },
        });

        if (existingUser) {
            console.log("Test user already exists!");
            console.log("Email: test@example.com");
            console.log("Password: password123");
            return;
        }

        // Hash password using SHA-1
        const password = "password123";
        const hashedPassword = CryptoJS.SHA1(password).toString();

        // Create test user
        const currentDate = new Date();
        const testUser = await Users.create({
            name: "Test User",
            email: "test@example.com",
            password: hashedPassword,
            date_added: currentDate,
            date_updated: currentDate,
        });

        console.log("Test user created successfully!");
        console.log("Email: test@example.com");
        console.log("Password: password123");
        console.log("User ID:", testUser.id_user);
    } catch (error) {
        console.error("Error creating test user:", error);
    } finally {
        process.exit();
    }
}

// Run if called directly
if (require.main === module) {
    createTestUser();
}

module.exports = { createTestUser };
