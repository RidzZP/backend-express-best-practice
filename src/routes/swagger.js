const express = require("express");
const router = express.Router();
const { specs, swaggerUi, swaggerOptions } = require("../config/swagger");

/**
 * @swagger
 * /docs:
 *   get:
 *     tags:
 *       - Documentation
 *     summary: API Documentation
 *     description: Interactive API documentation using Swagger UI
 *     responses:
 *       200:
 *         description: Swagger UI page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */

// Swagger UI setup
router.use("/docs", swaggerUi.serve);
router.get("/docs", swaggerUi.setup(specs, swaggerOptions));

// API spec endpoint
router.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
});

// Documentation routes
router.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "SIPLAH Dashboard API Documentation",
        documentation: {
            swagger_ui: "/docs",
            api_spec: "/api-docs.json",
            postman_collection: "/postman-collection.json",
        },
        versions: {
            v1: {
                documentation: "/docs#tag/Dashboard1",
                endpoints: "/api/v1",
            },
            v2: {
                documentation: "/docs#tag/Dashboard2",
                endpoints: "/api/v2",
            },
        },
        guides: {
            authentication: "/docs#tag/Authentication",
            export: "/docs#tag/Export",
            system: "/docs#tag/System",
        },
    });
});

// Postman collection generator
router.get("/postman-collection.json", (req, res) => {
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";

    const collection = {
        info: {
            name: "SIPLAH Dashboard API",
            description: "Comprehensive API collection for SIPLAH Dashboard System",
            version: "1.0.0",
            schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },
        variable: [
            {
                key: "baseUrl",
                value: baseUrl,
                type: "string",
            },
            {
                key: "token",
                value: "",
                type: "string",
                description: "JWT token for authentication",
            },
        ],
        auth: {
            type: "bearer",
            bearer: [
                {
                    key: "token",
                    value: "{{token}}",
                    type: "string",
                },
            ],
        },
        item: [
            {
                name: "Authentication",
                item: [
                    {
                        name: "Login",
                        request: {
                            method: "POST",
                            header: [
                                {
                                    key: "Content-Type",
                                    value: "application/json",
                                },
                            ],
                            body: {
                                mode: "raw",
                                raw: JSON.stringify(
                                    {
                                        login: "user@example.com",
                                        password: "password123",
                                        remember_me: false,
                                    },
                                    null,
                                    2
                                ),
                            },
                            url: {
                                raw: "{{baseUrl}}/api/v1/auth/login",
                                host: ["{{baseUrl}}"],
                                path: ["api", "v1", "auth", "login"],
                            },
                        },
                    },
                    {
                        name: "Register",
                        request: {
                            method: "POST",
                            header: [
                                {
                                    key: "Content-Type",
                                    value: "application/json",
                                },
                            ],
                            body: {
                                mode: "raw",
                                raw: JSON.stringify(
                                    {
                                        username: "john_doe",
                                        email: "john@example.com",
                                        password: "password123",
                                        password_confirmation: "password123",
                                        full_name: "John Doe",
                                    },
                                    null,
                                    2
                                ),
                            },
                            url: {
                                raw: "{{baseUrl}}/api/v1/auth/register",
                                host: ["{{baseUrl}}"],
                                path: ["api", "v1", "auth", "register"],
                            },
                        },
                    },
                    {
                        name: "Get Profile",
                        request: {
                            method: "GET",
                            header: [
                                {
                                    key: "Authorization",
                                    value: "Bearer {{token}}",
                                },
                            ],
                            url: {
                                raw: "{{baseUrl}}/api/v1/auth/profile",
                                host: ["{{baseUrl}}"],
                                path: ["api", "v1", "auth", "profile"],
                            },
                        },
                    },
                ],
            },
            {
                name: "Dashboard 1",
                item: [
                    {
                        name: "Get Overview",
                        request: {
                            method: "GET",
                            header: [
                                {
                                    key: "Authorization",
                                    value: "Bearer {{token}}",
                                },
                            ],
                            url: {
                                raw: "{{baseUrl}}/api/v1/dashboard1/overview?period=month",
                                host: ["{{baseUrl}}"],
                                path: ["api", "v1", "dashboard1", "overview"],
                                query: [
                                    {
                                        key: "period",
                                        value: "month",
                                    },
                                ],
                            },
                        },
                    },
                    {
                        name: "Get Analytics",
                        request: {
                            method: "GET",
                            header: [
                                {
                                    key: "Authorization",
                                    value: "Bearer {{token}}",
                                },
                            ],
                            url: {
                                raw: "{{baseUrl}}/api/v1/dashboard1/analytics?page=1&limit=10",
                                host: ["{{baseUrl}}"],
                                path: ["api", "v1", "dashboard1", "analytics"],
                                query: [
                                    {
                                        key: "page",
                                        value: "1",
                                    },
                                    {
                                        key: "limit",
                                        value: "10",
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
            {
                name: "Dashboard 2",
                item: [
                    {
                        name: "Get Reports",
                        request: {
                            method: "GET",
                            header: [
                                {
                                    key: "Authorization",
                                    value: "Bearer {{token}}",
                                },
                            ],
                            url: {
                                raw: "{{baseUrl}}/api/v2/dashboard2/reports?page=1&limit=10",
                                host: ["{{baseUrl}}"],
                                path: ["api", "v2", "dashboard2", "reports"],
                                query: [
                                    {
                                        key: "page",
                                        value: "1",
                                    },
                                    {
                                        key: "limit",
                                        value: "10",
                                    },
                                ],
                            },
                        },
                    },
                    {
                        name: "Generate Custom Report",
                        request: {
                            method: "POST",
                            header: [
                                {
                                    key: "Authorization",
                                    value: "Bearer {{token}}",
                                },
                                {
                                    key: "Content-Type",
                                    value: "application/json",
                                },
                            ],
                            body: {
                                mode: "raw",
                                raw: JSON.stringify(
                                    {
                                        report_type: "sales",
                                        name: "Monthly Sales Report - January 2025",
                                        date_range: {
                                            start_date: "2025-01-01",
                                            end_date: "2025-01-31",
                                        },
                                        format: "summary",
                                    },
                                    null,
                                    2
                                ),
                            },
                            url: {
                                raw: "{{baseUrl}}/api/v2/dashboard2/reports",
                                host: ["{{baseUrl}}"],
                                path: ["api", "v2", "dashboard2", "reports"],
                            },
                        },
                    },
                ],
            },
            {
                name: "Export",
                item: [
                    {
                        name: "Export to Excel",
                        request: {
                            method: "POST",
                            header: [
                                {
                                    key: "Authorization",
                                    value: "Bearer {{token}}",
                                },
                                {
                                    key: "Content-Type",
                                    value: "application/json",
                                },
                            ],
                            body: {
                                mode: "raw",
                                raw: JSON.stringify(
                                    {
                                        data_source: "users",
                                        format: "xlsx",
                                        columns: ["id", "name", "email", "created_at"],
                                        options: {
                                            include_headers: true,
                                            sheet_name: "Users Export",
                                        },
                                    },
                                    null,
                                    2
                                ),
                            },
                            url: {
                                raw: "{{baseUrl}}/api/export/excel",
                                host: ["{{baseUrl}}"],
                                path: ["api", "export", "excel"],
                            },
                        },
                    },
                    {
                        name: "Get Export Status",
                        request: {
                            method: "GET",
                            header: [
                                {
                                    key: "Authorization",
                                    value: "Bearer {{token}}",
                                },
                            ],
                            url: {
                                raw: "{{baseUrl}}/api/export/{{exportId}}/status",
                                host: ["{{baseUrl}}"],
                                path: ["api", "export", "{{exportId}}", "status"],
                            },
                        },
                    },
                ],
            },
            {
                name: "System",
                item: [
                    {
                        name: "Health Check",
                        request: {
                            method: "GET",
                            url: {
                                raw: "{{baseUrl}}/api/health",
                                host: ["{{baseUrl}}"],
                                path: ["api", "health"],
                            },
                        },
                    },
                    {
                        name: "System Metrics",
                        request: {
                            method: "GET",
                            header: [
                                {
                                    key: "Authorization",
                                    value: "Bearer {{token}}",
                                },
                            ],
                            url: {
                                raw: "{{baseUrl}}/api/metrics",
                                host: ["{{baseUrl}}"],
                                path: ["api", "metrics"],
                            },
                        },
                    },
                ],
            },
        ],
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
        "Content-Disposition",
        'attachment; filename="SIPLAH_Dashboard_API.postman_collection.json"'
    );
    res.json(collection);
});

module.exports = router;
