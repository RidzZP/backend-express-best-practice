const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SIPLAH Dashboard API",
            version: "1.0.0",
            description: "Comprehensive API documentation for SIPLAH Dashboard System",
            contact: {
                name: "API Support",
                email: "support@siplah.com",
            },
            license: {
                name: "MIT",
                url: "https://opensource.org/licenses/MIT",
            },
        },
        servers: [
            {
                url: process.env.BASE_URL || "http://localhost:3000",
                description: "Development server",
            },
            {
                url: process.env.PROD_URL || "https://api.siplah.com",
                description: "Production server",
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "JWT token for authentication",
                },
                ApiKeyAuth: {
                    type: "apiKey",
                    in: "header",
                    name: "X-API-KEY",
                    description: "API Key for service authentication",
                },
            },
            schemas: {
                Error: {
                    type: "object",
                    properties: {
                        status: {
                            type: "string",
                            example: "error",
                        },
                        message: {
                            type: "string",
                            example: "Error description",
                        },
                        error_code: {
                            type: "string",
                            example: "ERR_001",
                        },
                        timestamp: {
                            type: "string",
                            format: "date-time",
                            example: "2025-01-03T10:30:00Z",
                        },
                    },
                },
                Success: {
                    type: "object",
                    properties: {
                        status: {
                            type: "string",
                            example: "success",
                        },
                        message: {
                            type: "string",
                            example: "Operation completed successfully",
                        },
                        data: {
                            type: "object",
                            description: "Response data",
                        },
                        timestamp: {
                            type: "string",
                            format: "date-time",
                            example: "2025-01-03T10:30:00Z",
                        },
                    },
                },
                PaginatedResponse: {
                    type: "object",
                    properties: {
                        status: {
                            type: "string",
                            example: "success",
                        },
                        data: {
                            type: "array",
                            items: {
                                type: "object",
                            },
                        },
                        pagination: {
                            type: "object",
                            properties: {
                                page: {
                                    type: "integer",
                                    example: 1,
                                },
                                limit: {
                                    type: "integer",
                                    example: 10,
                                },
                                total: {
                                    type: "integer",
                                    example: 100,
                                },
                                totalPages: {
                                    type: "integer",
                                    example: 10,
                                },
                            },
                        },
                    },
                },
                User: {
                    type: "object",
                    properties: {
                        id_user: {
                            type: "integer",
                            example: 1,
                        },
                        name: {
                            type: "string",
                            example: "john_doe",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "john@example.com",
                        },
                        date_added: {
                            type: "string",
                            format: "date-time",
                            example: "2025-01-01T00:00:00Z",
                        },
                        date_updated: {
                            type: "string",
                            format: "date-time",
                            example: "2025-01-01T00:00:00Z",
                        },
                    },
                },
            },
            parameters: {
                PageParam: {
                    name: "page",
                    in: "query",
                    description: "Page number for pagination",
                    required: false,
                    schema: {
                        type: "integer",
                        minimum: 1,
                        default: 1,
                    },
                },
                LimitParam: {
                    name: "limit",
                    in: "query",
                    description: "Number of items per page",
                    required: false,
                    schema: {
                        type: "integer",
                        minimum: 1,
                        maximum: 100,
                        default: 10,
                    },
                },
                SortParam: {
                    name: "sort",
                    in: "query",
                    description:
                        "Sort field and direction (e.g., name:asc, created_at:desc)",
                    required: false,
                    schema: {
                        type: "string",
                        example: "created_at:desc",
                    },
                },
                SearchParam: {
                    name: "search",
                    in: "query",
                    description: "Search term for filtering results",
                    required: false,
                    schema: {
                        type: "string",
                    },
                },
            },
            responses: {
                UnauthorizedError: {
                    description: "Authentication required",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Error",
                            },
                            example: {
                                status: "error",
                                message: "Authentication required",
                                error_code: "AUTH_001",
                                timestamp: "2025-01-03T10:30:00Z",
                            },
                        },
                    },
                },
                ForbiddenError: {
                    description: "Insufficient permissions",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Error",
                            },
                            example: {
                                status: "error",
                                message: "Insufficient permissions",
                                error_code: "AUTH_002",
                                timestamp: "2025-01-03T10:30:00Z",
                            },
                        },
                    },
                },
                NotFoundError: {
                    description: "Resource not found",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Error",
                            },
                            example: {
                                status: "error",
                                message: "Resource not found",
                                error_code: "NOT_FOUND",
                                timestamp: "2025-01-03T10:30:00Z",
                            },
                        },
                    },
                },
                ValidationError: {
                    description: "Input validation failed",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Error",
                            },
                            example: {
                                status: "error",
                                message: "Validation failed",
                                error_code: "VALIDATION_ERROR",
                                timestamp: "2025-01-03T10:30:00Z",
                            },
                        },
                    },
                },
                ServerError: {
                    description: "Internal server error",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/Error",
                            },
                            example: {
                                status: "error",
                                message: "Internal server error",
                                error_code: "SERVER_ERROR",
                                timestamp: "2025-01-03T10:30:00Z",
                            },
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: "Authentication",
                description: "User authentication and authorization endpoints",
            },
            {
                name: "Dashboard1",
                description: "Dashboard 1 specific endpoints",
            },
            {
                name: "Dashboard2",
                description: "Dashboard 2 specific endpoints",
            },
            {
                name: "Export",
                description: "Data export functionality",
            },
            {
                name: "System",
                description: "System information and health check endpoints",
            },
        ],
    },
    apis: ["./src/routes/**/*.js", "./src/controllers/**/*.js", "./docs/swagger/*.yaml"],
};

const specs = swaggerJSDoc(options);

const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
        docExpansion: "none",
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true,
        requestSnippetsEnabled: true,
        displayRequestDuration: true,
    },
    customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #3b82f6 }
        .swagger-ui .info .description { margin-bottom: 2rem }
        .swagger-ui .scheme-container { background: #f8fafc; padding: 1rem; border-radius: 8px }
    `,
    customSiteTitle: "SIPLAH Dashboard API Documentation",
    customfavIcon: "/favicon.ico",
};

module.exports = {
    specs,
    swaggerUi,
    swaggerOptions,
};
