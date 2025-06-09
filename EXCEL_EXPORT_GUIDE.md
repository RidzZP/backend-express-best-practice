# Excel Export Guide

## Overview

This guide explains how to use the reusable Excel export functionality with streaming support for large datasets. The implementation uses ExcelJS and supports various data sources including arrays, database queries, and async generators.

## Features

-   Streaming Support: Handle large datasets efficiently
-   Multiple Data Sources: Arrays, async generators, database queries
-   Customizable Styling: Headers, fonts, colors, borders
-   Auto-fit Columns: Automatic column width adjustment
-   Data Transformation: Transform data before export
-   Multiple Export Formats: Direct response, buffer, file
-   Pagination Support: Built-in pagination for database queries
-   Sequelize Integration: Native support for Sequelize models

## Installation

First, install the required dependency:

```bash
npm install exceljs
```

## Quick Start

### Basic Usage

```javascript
const { ExcelExporter } = require("./src/utils/excelExporter");

const exporter = new ExcelExporter();
const data = [
    { name: "John Doe", email: "john@example.com", age: 30 },
    { name: "Jane Smith", email: "jane@example.com", age: 25 },
];

const columns = [
    { header: "Name", key: "name", width: 20 },
    { header: "Email", key: "email", width: 30 },
    { header: "Age", key: "age", width: 10 },
];

const config = {
    data,
    columns,
    filename: "users.xlsx",
};

const buffer = await exporter.exportToBuffer(config);
```

### Express Route Usage

```javascript
const ExcelService = require("./src/services/ExcelService");

router.get("/export/users", async (req, res) => {
    const excelService = new ExcelService();
    const { User } = require("../models");

    await excelService.exportUsers(User, req.query, res);
});
```

## API Reference

### ExcelExporter Class

#### Constructor Options

```javascript
const options = {
    sheetName: "Sheet1",
    headerStyle: {
        font: { bold: true, color: { argb: "FFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "middle" },
    },
    dataStyle: {
        alignment: { horizontal: "left", vertical: "middle" },
    },
    columnWidth: 15,
    autoFitColumns: true,
};

const exporter = new ExcelExporter(options);
```

#### Methods

##### exportToBuffer(config)

Exports data to Excel buffer.

Parameters:

-   config.data: Data source (array, function, or async generator)
-   config.columns: Column definitions array
-   config.filename: Output filename
-   config.dataTransform: Optional data transformation function
-   config.chunkSize: Number of rows to process at once (default: 1000)

Returns: Promise<Buffer>

##### exportToResponse(config, res)

Exports data directly to HTTP response stream.

Parameters:

-   config: Export configuration (same as exportToBuffer)
-   res: Express response object

##### createTransformStream(columns, dataTransform)

Creates a transform stream for processing data chunks.

Returns: Transform stream

### DataSourceHelpers Class

#### createDatabaseIterator(queryFn, batchSize)

Creates async generator from database query with pagination.

```javascript
const { DataSourceHelpers } = require("./src/utils/excelExporter");

const queryFn = async (offset, limit) => {
    return await db.query(`SELECT * FROM users LIMIT ${limit} OFFSET ${offset}`);
};

const dataSource = DataSourceHelpers.createDatabaseIterator(queryFn, 1000);
```

#### createSequelizeIterator(model, options, batchSize)

Creates async generator from Sequelize model with pagination.

```javascript
const dataSource = DataSourceHelpers.createSequelizeIterator(
    UserModel,
    { where: { status: "active" } },
    1000
);
```

### ExcelService Class

High-level service for common export operations.

#### Methods

-   exportUsers(UserModel, filters, res)
-   exportProducts(ProductModel, filters, res)
-   exportOrders(OrderModel, filters, res)
-   exportCustomData(config, res)
-   createExcelBuffer(config)
-   exportWithCustomQuery(queryFunction, columns, filename, res, options)

## Usage Examples

### 1. Large Dataset with Streaming

```javascript
async function* generateLargeDataset() {
    for (let i = 1; i <= 100000; i++) {
        yield {
            id: i,
            name: `User ${i}`,
            email: `user${i}@example.com`,
            created: new Date().toISOString(),
        };

        // Yield control periodically
        if (i % 1000 === 0) {
            await new Promise((resolve) => setImmediate(resolve));
        }
    }
}

const config = {
    data: generateLargeDataset(),
    columns: [
        { header: "ID", key: "id", width: 10 },
        { header: "Name", key: "name", width: 20 },
        { header: "Email", key: "email", width: 30 },
        { header: "Created", key: "created", width: 20 },
    ],
    filename: "large_export.xlsx",
    dataTransform: (item) => ({
        ...item,
        created: new Date(item.created).toLocaleDateString(),
    }),
};

await exporter.exportToResponse(config, res);
```

### 2. Database Export with Pagination

```javascript
const { User } = require("../models");

const dataSource = DataSourceHelpers.createSequelizeIterator(
    User,
    {
        where: { status: "active" },
        include: [{ model: Profile, as: "profile" }],
    },
    500 // Batch size
);

const config = {
    data: dataSource,
    columns: [
        { header: "ID", key: "id", width: 10 },
        { header: "Name", key: "name", width: 20 },
        { header: "Email", key: "email", width: 30 },
        { header: "Phone", key: "profile.phone", width: 15 },
    ],
    filename: "active_users.xlsx",
    dataTransform: (user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user["profile.phone"] || "",
    }),
};

await exporter.exportToResponse(config, res);
```
