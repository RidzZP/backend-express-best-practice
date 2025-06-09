# Express MVC API Server with Transaction Security

## Overview

API server dengan arsitektur MVC yang dilengkapi dengan **Transaction Security** untuk keamanan data saat pengiriman. Semua operasi database yang mengubah data (CREATE, UPDATE, DELETE) menggunakan database transactions dengan automatic rollback untuk menjamin konsistensi data.

## 🔒 Transaction Security Features

### ✅ Automatic Transaction Management

-   **GET requests**: Tidak menggunakan transaksi (read-only operations)
-   **POST/PUT/PATCH/DELETE requests**: Otomatis menggunakan transaksi
-   **Success response (2xx)**: Transaksi di-commit
-   **Error response (4xx/5xx)**: Transaksi di-rollback

### ✅ Data Integrity Protection

-   **Atomic Operations**: Semua operasi dalam satu transaksi
-   **Automatic Rollback**: Jika ada error, semua perubahan dibatalkan
-   **Batch Operations**: Multiple operations dengan konsistensi data terjamin
-   **Connection Safety**: Transaksi dibersihkan jika koneksi terputus

### ✅ Enhanced Batch Operations

-   **Bulk Create**: Create multiple products dalam satu transaksi
-   **Batch Update**: Update multiple products sekaligus
-   **Batch Delete**: Delete multiple products secara aman
-   **Category Transfer**: Transfer products antar kategori dengan data integrity

## 🚀 Quick Start

```bash
# Clone repository
git clone <repository-url>
cd test-cursor-code

# Install dependencies
npm install

# Setup environment variables
cp env.example .env
# Edit .env file dengan database credentials

# Start development server
npm run dev

# Or start production server
npm start
```

## 📊 API Endpoints dengan Transaction Support

### Basic Operations

```
GET    /api/v1/dashboard2/products           # List products (no transaction)
GET    /api/v1/dashboard2/products/:id       # Get product (no transaction)
POST   /api/v1/dashboard2/products           # Create product (with transaction)
PUT    /api/v1/dashboard2/products/:id       # Update product (with transaction)
DELETE /api/v1/dashboard2/products/:id       # Delete product (with transaction)
```

### Advanced Batch Operations

```
POST   /api/v1/dashboard2/products/bulk                   # Bulk create (with transaction)
PATCH  /api/v1/dashboard2/products/batch/update          # Batch update (with transaction)
DELETE /api/v1/dashboard2/products/batch/delete          # Batch delete (with transaction)
PATCH  /api/v1/dashboard2/products/transfer/category     # Category transfer (with transaction)
```

### V2 Enhanced Endpoints

```
POST   /api/v2/dashboard2/products/bulk-import                     # Enhanced bulk import
PATCH  /api/v2/dashboard2/products/operations/batch-update        # Advanced batch update
DELETE /api/v2/dashboard2/products/operations/batch-delete        # Advanced batch delete
PATCH  /api/v2/dashboard2/products/operations/transfer-category   # Advanced category transfer
```

## 🔍 Usage Examples

### Create Single Product

```javascript
const response = await fetch("/api/v1/dashboard2/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        name: "Laptop Gaming",
        category_name: "Electronics",
        price: 15999.99,
    }),
});
```

### Bulk Create Products

```javascript
const response = await fetch("/api/v1/dashboard2/products/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        products: [
            { name: "Product 1", category_name: "Electronics", price: 999.99 },
            { name: "Product 2", category_name: "Books", price: 29.99 },
        ],
    }),
});
```

### Batch Update Products

```javascript
const response = await fetch("/api/v1/dashboard2/products/batch/update", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        updates: [
            { id: 1, data: { name: "Updated Product 1", price: 899.99 } },
            { id: 2, data: { name: "Updated Product 2", price: 39.99 } },
        ],
    }),
});
```

### Transfer Products Between Categories

```javascript
const response = await fetch("/api/v1/dashboard2/products/transfer/category", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        productIds: [1, 2, 3],
        newCategory: "Premium Electronics",
    }),
});
```

## 🛡️ Security Benefits

### 1. Data Consistency

-   Semua operasi dalam satu transaksi dijamin konsisten
-   Tidak ada partial updates yang bisa merusak integritas data
-   Atomic operations untuk batch processing

### 2. Error Recovery

-   Automatic rollback pada database errors
-   Comprehensive logging untuk audit trail
-   Graceful handling untuk connection issues

### 3. Concurrent Access Protection

-   Database-level locking dengan transaksi
-   Isolation level protection
-   Race condition prevention

## 📁 Project Structure

```
src/
├── controllers/           # Request handlers dengan transaction support
│   ├── ProductController.js
│   └── BaseController.js
├── services/             # Business logic dengan transaction operations
│   ├── ProductService.js
│   └── BaseService.js
├── models/               # Database models
│   ├── Product.js
│   └── index.js
├── middlewares/          # Custom middlewares
│   ├── transactionMiddleware.js  # Transaction management
│   └── errorHandler.js
├── routes/               # API routes dengan transaction middleware
│   ├── v1/
│   │   └── dashboard2/
│   │       └── products.js
│   └── v2/
│       └── dashboard2/
│           └── products.js
├── config/               # Configuration files
│   └── database.js       # Database connection dengan transaction support
└── utils/                # Utility functions
    └── logger.js
```

## 🧪 Testing Transaction Features

```bash
# Install axios for examples
npm install axios

# Run transaction examples
node examples/transaction_examples.js
```

## 📝 Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DIALECT=mysql

# Server Configuration
PORT=3000
NODE_ENV=development

# API Configuration
API_PREFIX=/api
API_VERSION_1=/v1
API_VERSION_2=/v2
```

## 📚 Documentation

-   [Transaction Security Guide](docs/TRANSACTION_SECURITY.md) - Detailed guide untuk transaction features
-   [API Documentation](docs/API_PRODUCT.md) - Complete API reference
-   [Usage Guide](USAGE_GUIDE.md) - Getting started guide

## 🔧 Development

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
npm run lint       # Run linter
```

### Transaction Middleware

-   `transactionManager`: Automatic transaction management based on HTTP methods
-   `withTransaction`: Wrapper untuk controller methods yang memerlukan transaksi khusus
-   `executeInTransaction`: Utility function untuk operations dalam transaksi

### Error Handling

-   Automatic rollback pada validation errors
-   Comprehensive error logging
-   Graceful error responses dengan transaction status

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/transaction-enhancement`)
3. Commit changes (`git commit -am 'Add transaction feature'`)
4. Push to branch (`git push origin feature/transaction-enhancement`)
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

Jika ada pertanyaan tentang transaction security features:

1. Check [Transaction Security Guide](docs/TRANSACTION_SECURITY.md)
2. Review [Examples](examples/transaction_examples.js)
3. Check server logs untuk transaction status
4. Create issue di repository

---

**⚡ Enhanced with Transaction Security for Data Integrity**
