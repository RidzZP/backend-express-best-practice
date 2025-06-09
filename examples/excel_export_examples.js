const { ExcelExporter, DataSourceHelpers } = require("../src/utils/excelExporter");
const ExcelService = require("../src/services/ExcelService");

/**
 * Examples of using the Excel Export functionality
 */

// Example 1: Basic array export
async function basicArrayExport() {
    const exporter = new ExcelExporter();

    const data = [
        { name: "John Doe", email: "john@example.com", age: 30 },
        { name: "Jane Smith", email: "jane@example.com", age: 25 },
        { name: "Bob Johnson", email: "bob@example.com", age: 35 },
    ];

    const columns = [
        { header: "Name", key: "name", width: 20 },
        { header: "Email", key: "email", width: 30 },
        { header: "Age", key: "age", width: 10 },
    ];

    const config = {
        data,
        columns,
        filename: "users_example.xlsx",
        sheetOptions: { name: "Users" },
    };

    const buffer = await exporter.exportToBuffer(config);
    console.log("Basic export completed, buffer size:", buffer.length);
    return buffer;
}

// Example 2: Streaming with async generator
async function* generateLargeDataset() {
    for (let i = 1; i <= 10000; i++) {
        yield {
            id: i,
            name: `User ${i}`,
            email: `user${i}@example.com`,
            created: new Date().toISOString(),
        };

        // Simulate async operation
        if (i % 1000 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 10));
        }
    }
}

async function streamingExport() {
    const exporter = new ExcelExporter();

    const columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Name", key: "name", width: 20 },
        { header: "Email", key: "email", width: 30 },
        { header: "Created", key: "created", width: 20 },
    ];

    const config = {
        data: generateLargeDataset(),
        columns,
        filename: "large_dataset.xlsx",
        dataTransform: (item) => ({
            ...item,
            created: new Date(item.created).toLocaleDateString(),
        }),
    };

    const buffer = await exporter.exportToBuffer(config);
    console.log("Streaming export completed, buffer size:", buffer.length);
    return buffer;
}

// Example 3: Database iterator with pagination
async function databaseExport() {
    // Mock database query function
    const mockQueryFunction = async (offset, limit) => {
        // Simulate database query with pagination
        const data = [];
        const start = offset;
        const end = Math.min(offset + limit, 5000); // Mock total of 5000 records

        for (let i = start; i < end; i++) {
            data.push({
                id: i + 1,
                product_name: `Product ${i + 1}`,
                price: Math.random() * 100,
                stock: Math.floor(Math.random() * 1000),
                category: ["Electronics", "Clothing", "Books"][
                    Math.floor(Math.random() * 3)
                ],
            });
        }

        return data;
    };

    const exporter = new ExcelExporter();
    const dataSource = DataSourceHelpers.createDatabaseIterator(mockQueryFunction, 500);

    const columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Product Name", key: "product_name", width: 30 },
        { header: "Price", key: "price", width: 15 },
        { header: "Stock", key: "stock", width: 15 },
        { header: "Category", key: "category", width: 20 },
    ];

    const config = {
        data: dataSource,
        columns,
        filename: "products_export.xlsx",
        dataTransform: (product) => ({
            ...product,
            price: `$${parseFloat(product.price).toFixed(2)}`,
        }),
    };

    const buffer = await exporter.exportToBuffer(config);
    console.log("Database export completed, buffer size:", buffer.length);
    return buffer;
}

// Example 4: Custom styling and formatting
async function customStyledExport() {
    const customOptions = {
        headerStyle: {
            font: { bold: true, color: { argb: "FFFFFF" } },
            fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF4500" } },
            alignment: { horizontal: "center", vertical: "middle" },
        },
        dataStyle: {
            alignment: { horizontal: "left", vertical: "middle" },
        },
        autoFitColumns: true,
    };

    const exporter = new ExcelExporter(customOptions);

    const data = [
        { company: "Tech Corp", revenue: 1500000, employees: 150, founded: "2010-01-15" },
        { company: "StartUp Inc", revenue: 750000, employees: 45, founded: "2018-06-20" },
        {
            company: "Global Ltd",
            revenue: 3200000,
            employees: 320,
            founded: "2005-11-30",
        },
    ];

    const columns = [
        { header: "Company Name", key: "company", width: 25 },
        { header: "Annual Revenue", key: "revenue", width: 20 },
        { header: "Employees", key: "employees", width: 15 },
        { header: "Founded", key: "founded", width: 15 },
    ];

    const config = {
        data,
        columns,
        filename: "companies_styled.xlsx",
        dataTransform: (company) => ({
            ...company,
            revenue: `$${company.revenue.toLocaleString()}`,
            founded: new Date(company.founded).getFullYear(),
        }),
        sheetOptions: { name: "Companies" },
    };

    const buffer = await exporter.exportToBuffer(config);
    console.log("Custom styled export completed, buffer size:", buffer.length);
    return buffer;
}

// Example 5: Using Excel Service
async function serviceExport() {
    const excelService = new ExcelService();

    // Mock Sequelize model
    const MockUserModel = {
        findAll: async ({ where, offset, limit, raw }) => {
            const data = [];
            const start = offset || 0;
            const end = Math.min(start + (limit || 100), 1000);

            for (let i = start; i < end; i++) {
                data.push({
                    id: i + 1,
                    name: `User ${i + 1}`,
                    email: `user${i + 1}@example.com`,
                    status: ["active", "inactive"][Math.floor(Math.random() * 2)],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }

            return data;
        },
    };

    // Mock response object
    const mockResponse = {
        setHeader: (name, value) => console.log(`Header: ${name} = ${value}`),
        write: (data) => console.log("Writing data chunk..."),
        end: () => console.log("Response ended"),
    };

    try {
        await excelService.exportUsers(MockUserModel, { status: "active" }, mockResponse);
        console.log("Service export completed");
    } catch (error) {
        console.error("Service export failed:", error.message);
    }
}

// Example 6: Transform stream usage
async function transformStreamExample() {
    const { Transform } = require("stream");
    const exporter = new ExcelExporter();

    const columns = [
        { header: "Name", key: "name" },
        { header: "Email", key: "email" },
        { header: "Domain", key: "domain" },
    ];

    // Create transform stream that extracts domain from email
    const transformStream = exporter.createTransformStream(columns, (data) => ({
        name: data.name,
        email: data.email,
        domain: data.email.split("@")[1] || "",
    }));

    console.log("Transform stream created successfully");
    return transformStream;
}

// Run examples
async function runExamples() {
    try {
        console.log("Running Excel Export Examples...\n");

        console.log("1. Basic Array Export:");
        await basicArrayExport();

        console.log("\n2. Streaming Export:");
        await streamingExport();

        console.log("\n3. Database Export:");
        await databaseExport();

        console.log("\n4. Custom Styled Export:");
        await customStyledExport();

        console.log("\n5. Service Export:");
        await serviceExport();

        console.log("\n6. Transform Stream Example:");
        await transformStreamExample();

        console.log("\nAll examples completed successfully!");
    } catch (error) {
        console.error("Example failed:", error);
    }
}

// Export functions for individual testing
module.exports = {
    basicArrayExport,
    streamingExport,
    databaseExport,
    customStyledExport,
    serviceExport,
    transformStreamExample,
    runExamples,
};

// Run examples if this file is executed directly
if (require.main === module) {
    runExamples();
}
