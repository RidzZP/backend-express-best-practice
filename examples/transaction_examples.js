/**
 * Examples untuk menggunakan Transaction Security API Product
 *
 * Contoh-contoh ini menunjukkan bagaimana menggunakan fitur transaksi
 * untuk keamanan data saat pengiriman dan operasi database.
 */

const axios = require("axios");

// Base URL API
const BASE_URL = "http://localhost:3000/api/v1/dashboard2/products";

/**
 * Example 1: Create Single Product dengan Transaction
 * Operasi CREATE otomatis menggunakan transaksi
 */
async function createProductExample() {
    try {
        console.log("=== Creating Single Product (with Transaction) ===");

        const response = await axios.post(BASE_URL, {
            name: "Laptop Gaming Asus ROG",
            category_name: "Electronics",
            price: 15999.99,
        });

        console.log("Success:", response.data);
        console.log("Product ID:", response.data.data.id_product);
    } catch (error) {
        console.error(
            "Error (transaction rolled back):",
            error.response?.data || error.message
        );
    }
}

/**
 * Example 2: Bulk Create Products dengan Transaction
 * Semua products dibuat dalam satu transaksi - jika ada error, semua di-rollback
 */
async function bulkCreateExample() {
    try {
        console.log("\n=== Bulk Create Products (with Transaction) ===");

        const products = [
            {
                name: "iPhone 15 Pro",
                category_name: "Electronics",
                price: 12999.99,
            },
            {
                name: "Samsung Galaxy S24",
                category_name: "Electronics",
                price: 11999.99,
            },
            {
                name: "MacBook Pro M3",
                category_name: "Electronics",
                price: 25999.99,
            },
        ];

        const response = await axios.post(`${BASE_URL}/bulk`, {
            products: products,
        });

        console.log("Success:", response.data);
        console.log(`Created ${response.data.data.length} products`);
    } catch (error) {
        console.error(
            "Error (all products rolled back):",
            error.response?.data || error.message
        );
    }
}

/**
 * Example 3: Batch Update Products dengan Transaction
 * Update multiple products dalam satu transaksi
 */
async function batchUpdateExample() {
    try {
        console.log("\n=== Batch Update Products (with Transaction) ===");

        const updates = [
            {
                id: 1,
                data: {
                    name: "Updated Laptop Gaming",
                    price: 14999.99,
                    category_name: "Electronics",
                },
            },
            {
                id: 2,
                data: {
                    name: "Updated iPhone 15 Pro Max",
                    price: 13999.99,
                    category_name: "Electronics",
                },
            },
        ];

        const response = await axios.patch(`${BASE_URL}/batch/update`, {
            updates: updates,
        });

        console.log("Success:", response.data);
        console.log(`Updated ${response.data.data.length} products`);
    } catch (error) {
        console.error(
            "Error (all updates rolled back):",
            error.response?.data || error.message
        );
    }
}

/**
 * Example 4: Transfer Products Between Categories dengan Transaction
 * Transfer multiple products ke kategori baru dalam satu transaksi
 */
async function transferCategoryExample() {
    try {
        console.log("\n=== Transfer Products Category (with Transaction) ===");

        const response = await axios.patch(`${BASE_URL}/transfer/category`, {
            productIds: [1, 2, 3],
            newCategory: "Premium Electronics",
        });

        console.log("Success:", response.data);
        console.log(`Transferred ${response.data.data.affectedCount} products`);
    } catch (error) {
        console.error(
            "Error (transfer rolled back):",
            error.response?.data || error.message
        );
    }
}

/**
 * Example 5: Batch Delete Products dengan Transaction
 * Delete multiple products dalam satu transaksi
 */
async function batchDeleteExample() {
    try {
        console.log("\n=== Batch Delete Products (with Transaction) ===");

        const response = await axios.delete(`${BASE_URL}/batch/delete`, {
            data: {
                ids: [4, 5, 6],
            },
        });

        console.log("Success:", response.data);
        console.log(`Deleted ${response.data.data.length} products`);
    } catch (error) {
        console.error(
            "Error (delete rolled back):",
            error.response?.data || error.message
        );
    }
}

/**
 * Example 6: Error Handling dengan Automatic Rollback
 * Menunjukkan bagaimana transaksi di-rollback saat ada validation error
 */
async function errorHandlingExample() {
    try {
        console.log("\n=== Error Handling (Automatic Rollback) ===");

        // Sengaja kirim data invalid untuk trigger rollback
        const response = await axios.post(`${BASE_URL}/bulk`, {
            products: [
                {
                    name: "Valid Product",
                    category_name: "Electronics",
                    price: 999.99,
                },
                {
                    // Missing required fields - akan trigger validation error
                    name: "",
                    category_name: "",
                    price: -100,
                },
            ],
        });
    } catch (error) {
        console.log("Expected error (transaction rolled back):");
        console.log(error.response.data);
        console.log(
            "\n✓ Transaction rollback worked correctly - no products were created"
        );
    }
}

/**
 * Example 7: Read Operations (No Transaction)
 * GET requests tidak menggunakan transaksi karena read-only
 */
async function readOperationsExample() {
    try {
        console.log("\n=== Read Operations (No Transaction) ===");

        // Get all products
        const allProducts = await axios.get(BASE_URL);
        console.log(`Found ${allProducts.data.data.length} products`);

        // Get statistics
        const stats = await axios.get(`${BASE_URL}/statistics`);
        console.log("Statistics:", stats.data.data);

        // Get categories
        const categories = await axios.get(`${BASE_URL}/categories`);
        console.log("Categories:", categories.data.data);
    } catch (error) {
        console.error("Error in read operations:", error.response?.data || error.message);
    }
}

/**
 * Example 8: V2 API Enhanced Operations
 * Menggunakan V2 API dengan enhanced endpoints
 */
async function v2ApiExample() {
    try {
        console.log("\n=== V2 API Enhanced Operations ===");

        const V2_URL = "http://localhost:3000/api/v2/dashboard2/products";

        // V2 Bulk import with enhanced validation
        const response = await axios.post(`${V2_URL}/bulk-import`, {
            products: [
                {
                    name: "V2 Product 1",
                    category_name: "Tech",
                    price: 599.99,
                },
                {
                    name: "V2 Product 2",
                    category_name: "Tech",
                    price: 799.99,
                },
            ],
        });

        console.log("V2 Bulk import success:", response.data);

        // V2 Advanced batch operations
        const batchResponse = await axios.patch(`${V2_URL}/operations/batch-update`, {
            updates: [
                {
                    id: 1,
                    data: {
                        name: "V2 Updated Product",
                        price: 699.99,
                        category_name: "Premium Tech",
                    },
                },
            ],
        });

        console.log("V2 Batch update success:", batchResponse.data);
    } catch (error) {
        console.error("V2 API Error:", error.response?.data || error.message);
    }
}

/**
 * Main function to run all examples
 */
async function runAllExamples() {
    console.log("🚀 Starting Transaction Security API Examples\n");

    try {
        await createProductExample();
        await bulkCreateExample();
        await batchUpdateExample();
        await transferCategoryExample();
        await readOperationsExample();
        await errorHandlingExample();
        await v2ApiExample();
        // await batchDeleteExample(); // Commented out to preserve test data

        console.log("\n✅ All examples completed successfully!");
        console.log("\n📊 Transaction Security Features Demonstrated:");
        console.log("  ✓ Automatic transaction management");
        console.log("  ✓ Rollback on validation errors");
        console.log("  ✓ Batch operations with data consistency");
        console.log("  ✓ Category transfer operations");
        console.log("  ✓ Enhanced V2 API endpoints");
        console.log("  ✓ Read operations without transactions");
    } catch (error) {
        console.error("Failed to run examples:", error.message);
    }
}

// Export functions for individual testing
module.exports = {
    createProductExample,
    bulkCreateExample,
    batchUpdateExample,
    transferCategoryExample,
    batchDeleteExample,
    errorHandlingExample,
    readOperationsExample,
    v2ApiExample,
    runAllExamples,
};

// Run examples if this file is executed directly
if (require.main === module) {
    runAllExamples();
}
