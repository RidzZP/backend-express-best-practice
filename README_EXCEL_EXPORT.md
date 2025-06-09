# Excel Export Implementation

Implementasi export Excel yang reusable dengan dukungan streaming untuk dataset besar menggunakan ExcelJS.

## Fitur Utama

🚀 **Streaming Support** - Menangani dataset besar secara efisien  
📊 **Multiple Data Sources** - Array, async generators, database queries  
🎨 **Customizable Styling** - Header, font, warna, border yang dapat disesuaikan  
📏 **Auto-fit Columns** - Penyesuaian lebar kolom otomatis  
🔄 **Data Transformation** - Transformasi data sebelum export  
📤 **Multiple Export Formats** - Direct response, buffer, file  
📄 **Pagination Support** - Built-in pagination untuk database queries  
🗃️ **Sequelize Integration** - Dukungan native untuk Sequelize models

## Instalasi

```bash
# Install dependency ExcelJS
npm install exceljs
```

## Quick Start

### 1. Basic Export

```javascript
const { ExcelExporter } = require("./src/utils/excelExporter");

const exporter = new ExcelExporter();
const data = [
    { nama: "John Doe", email: "john@example.com", umur: 30 },
    { nama: "Jane Smith", email: "jane@example.com", umur: 25 },
];

const columns = [
    { header: "Nama", key: "nama", width: 20 },
    { header: "Email", key: "email", width: 30 },
    { header: "Umur", key: "umur", width: 10 },
];

const buffer = await exporter.exportToBuffer({
    data,
    columns,
    filename: "users.xlsx",
});
```

### 2. Export via HTTP Response

```javascript
const ExcelService = require("./src/services/ExcelService");

// Di dalam controller/route
app.get("/api/v1/export/users", async (req, res) => {
    const excelService = new ExcelService();
    const { User } = require("./src/models");

    await excelService.exportUsers(User, req.query, res);
});
```

### 3. Large Dataset dengan Streaming

```javascript
async function* generateLargeData() {
    for (let i = 1; i <= 100000; i++) {
        yield {
            id: i,
            nama: `User ${i}`,
            email: `user${i}@example.com`,
            created: new Date(),
        };

        // Yield control setiap 1000 records
        if (i % 1000 === 0) {
            await new Promise((resolve) => setImmediate(resolve));
        }
    }
}

const config = {
    data: generateLargeData(),
    columns: [
        { header: "ID", key: "id", width: 10 },
        { header: "Nama", key: "nama", width: 20 },
        { header: "Email", key: "email", width: 30 },
        { header: "Tanggal Dibuat", key: "created", width: 20 },
    ],
    filename: "large_export.xlsx",
    dataTransform: (item) => ({
        ...item,
        created: item.created.toLocaleDateString("id-ID"),
    }),
};

await exporter.exportToResponse(config, res);
```

## API Endpoints

### GET /api/v1/export/users

Export data users dengan filter query

**Query Parameters:**

-   `status` - Filter berdasarkan status
-   `nama_like` - Filter nama (contains)
-   `created_gte` - Filter tanggal dibuat (>= tanggal)
-   `email_like` - Filter email (contains)

**Contoh:**

```
GET /api/v1/export/users?status=active&nama_like=john&created_gte=2023-01-01
```

### POST /api/v1/export/custom

Export data custom dengan konfigurasi dinamis

**Request Body:**

```json
{
    "modelName": "User",
    "columns": [
        { "header": "Nama", "key": "nama", "width": 20 },
        { "header": "Email", "key": "email", "width": 30 }
    ],
    "filters": { "status": "active" },
    "filename": "custom_export.xlsx",
    "sheetName": "Data Custom"
}
```

### POST /api/v1/export/query

Export menggunakan SQL query custom

**Request Body:**

```json
{
    "query": "SELECT nama, email FROM users WHERE status = 'active'",
    "columns": [
        { "header": "Nama", "key": "nama", "width": 20 },
        { "header": "Email", "key": "email", "width": 30 }
    ],
    "filename": "query_results.xlsx"
}
```

## Struktur File

```
src/
├── utils/
│   └── excelExporter.js       # Core ExcelExporter class
├── services/
│   └── ExcelService.js        # High-level service layer
├── controllers/
│   └── ExportController.js    # HTTP request handlers
└── routes/
    └── exportRoutes.js        # Route definitions

examples/
└── excel_export_examples.js   # Contoh penggunaan lengkap
```

## Konfigurasi Custom Styling

```javascript
const customExporter = new ExcelExporter({
    headerStyle: {
        font: { bold: true, color: { argb: "FFFFFF" }, size: 12 },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF4500" } },
        alignment: { horizontal: "center", vertical: "middle" },
    },
    dataStyle: {
        font: { size: 10 },
        alignment: { horizontal: "left", vertical: "middle" },
    },
    autoFitColumns: true,
});
```

## Data Sources

### 1. Array Biasa

```javascript
const data = [
    { nama: "John", email: "john@example.com" },
    { nama: "Jane", email: "jane@example.com" },
];
```

### 2. Async Generator

```javascript
async function* dataGenerator() {
    for (let i = 0; i < 10000; i++) {
        yield { id: i, nama: `User ${i}` };
    }
}
```

### 3. Database dengan Pagination

```javascript
const { DataSourceHelpers } = require("./src/utils/excelExporter");

const dataSource = DataSourceHelpers.createSequelizeIterator(
    UserModel,
    { where: { status: "active" } },
    1000 // batch size
);
```

### 4. Custom Query Function

```javascript
const queryFn = async (offset, limit) => {
    return await db.query(`
        SELECT * FROM users 
        WHERE status = 'active' 
        LIMIT ${limit} OFFSET ${offset}
    `);
};

const dataSource = DataSourceHelpers.createDatabaseIterator(queryFn, 1000);
```

## Testing

Jalankan contoh untuk testing:

```bash
# Test semua contoh
npm run test:excel

# Atau jalankan manual
node examples/excel_export_examples.js
```

## Performance Tips

### Memory Management

-   Gunakan streaming untuk dataset > 10,000 rows
-   Sesuaikan `chunkSize` berdasarkan memory yang tersedia
-   Gunakan `raw: true` di Sequelize untuk performa lebih baik

### Database Optimization

-   Gunakan index yang tepat untuk filter conditions
-   Batasi included associations
-   Gunakan pagination dengan batch size yang reasonable (500-2000 rows)

### Styling Performance

-   Minimalisir styling complex untuk dataset besar
-   Disable `autoFitColumns` untuk export yang sangat besar
-   Gunakan consistent column widths bila memungkinkan

## Error Handling

```javascript
try {
    await excelService.exportUsers(User, filters, res);
} catch (error) {
    logger.error("Export failed:", error);

    if (!res.headersSent) {
        res.status(500).json({
            success: false,
            message: "Export gagal",
            error: error.message,
        });
    }
}
```

## Contoh Lengkap

Lihat file `examples/excel_export_examples.js` untuk contoh penggunaan yang lengkap termasuk:

1. Basic array export
2. Streaming dengan async generator
3. Database export dengan pagination
4. Custom styling dan formatting
5. Menggunakan Excel Service
6. Transform stream usage

## Troubleshooting

### Error Umum

1. **Memory Error**: Kurangi chunk size atau gunakan streaming
2. **Timeout Error**: Tingkatkan request timeout untuk export besar
3. **Encoding Issues**: Pastikan proper UTF-8 handling
4. **Style Conflicts**: Periksa format style object

### Debug Mode

```javascript
const exporter = new ExcelExporter({
    // Tambahkan logging jika diperlukan
});
```

Implementasi ini memberikan solusi yang robust dan scalable untuk Excel exports dengan dukungan streaming untuk dataset besar. Design modular memungkinkan customization dan extension yang mudah sesuai kebutuhan spesifik.
