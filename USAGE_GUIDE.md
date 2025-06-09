# Panduan Penggunaan Product CRUD

Panduan lengkap untuk menggunakan sistem CRUD Product yang sudah dibuat dalam template Express MVC.

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Copy environment file
cp env.example .env

# Edit konfigurasi database di .env
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=your_database_name
# DB_USERNAME=your_username
# DB_PASSWORD=your_password
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

```bash
# Lihat status database
npm run db:push status

# Sync models ke database (safe mode)
npm run db:push safe

# Atau jika ingin alter table existing
npm run db:push alter
```

### 4. Jalankan Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:3000`

## 📡 Testing API Endpoints

### Base URL

-   **V1:** `http://localhost:3000/api/v1/dashboard2/products`
-   **V2:** `http://localhost:3000/api/v2/dashboard2/products`

### 1. Health Check

```bash
curl http://localhost:3000/health
```

### 2. API Info

```bash
# General API info
curl http://localhost:3000/api/

# Dashboard2 info
curl http://localhost:3000/api/v1/dashboard2/
```

### 3. Product CRUD Operations

#### a. Get All Products

```bash
# Basic
curl http://localhost:3000/api/v1/dashboard2/products

# With pagination
curl "http://localhost:3000/api/v1/dashboard2/products?page=1&limit=5"

# With search
curl "http://localhost:3000/api/v1/dashboard2/products?search=laptop"

# With category filter
curl "http://localhost:3000/api/v1/dashboard2/products?category=Electronics"

# With price range
curl "http://localhost:3000/api/v1/dashboard2/products?minPrice=1000000&maxPrice=5000000"

# With sorting
curl "http://localhost:3000/api/v1/dashboard2/products?sortBy=price&sortOrder=ASC"
```

#### b. Get Product by ID

```bash
curl http://localhost:3000/api/v1/dashboard2/products/1
```

#### c. Create Product

```bash
curl -X POST http://localhost:3000/api/v1/dashboard2/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Gaming ROG",
    "category_name": "Electronics",
    "price": 25000000
  }'
```

#### d. Update Product

```bash
curl -X PUT http://localhost:3000/api/v1/dashboard2/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Gaming ROG Updated",
    "category_name": "Electronics",
    "price": 27000000
  }'
```

#### e. Delete Product

```bash
curl -X DELETE http://localhost:3000/api/v1/dashboard2/products/1
```

#### f. Search Products

```bash
curl http://localhost:3000/api/v1/dashboard2/products/search/gaming
```

#### g. Get Products by Category

```bash
curl http://localhost:3000/api/v1/dashboard2/products/category/Electronics
```

#### h. Get Products by Price Range

```bash
curl "http://localhost:3000/api/v1/dashboard2/products/price-range?minPrice=5000000&maxPrice=15000000"
```

#### i. Get All Categories

```bash
curl http://localhost:3000/api/v1/dashboard2/products/categories
```

#### j. Get Product Statistics

```bash
curl http://localhost:3000/api/v1/dashboard2/products/statistics
```

#### k. Bulk Create Products

```bash
curl -X POST http://localhost:3000/api/v1/dashboard2/products/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "name": "Mouse Gaming",
        "category_name": "Electronics",
        "price": 500000
      },
      {
        "name": "Keyboard Mechanical",
        "category_name": "Electronics",
        "price": 1200000
      },
      {
        "name": "Headset Gaming",
        "category_name": "Electronics",
        "price": 800000
      }
    ]
  }'
```

## 🛠️ Database Operations

### Menarik Table dari Database Existing

```bash
# Pull semua table dari database
npm run db:pull
```

### Push Changes ke Database

```bash
# Safe mode (hanya create table baru)
npm run db:push safe

# Alter mode (ubah struktur table existing)
npm run db:push alter

# Force mode (drop dan recreate semua table) - HATI-HATI!
npm run db:push force

# Create table untuk model specific
npm run db:push create Product

# Alter table specific
npm run db:push alter-table Product
```

### Manage Models

```bash
# Lihat daftar model files
npm run models:clean list

# Hapus semua model files
npm run models:clean all

# Hapus model specific
npm run models:clean model Product
```

## 📝 Struktur yang Sudah Dibuat

### 1. Model: `src/models/Product.js`

-   Primary key: `id_product`
-   Fields: `name`, `category_name`, `price`, `date_added`, `date_updated`

### 2. Service: `src/services/ProductService.js`

-   Extends `BaseService`
-   Custom methods untuk Product operations
-   Handles custom primary key `id_product`
-   Auto-generate timestamps

### 3. Controller: `src/controllers/ProductController.js`

-   Extends `BaseController`
-   Advanced filtering dan searching
-   Validation untuk create/update
-   Bulk operations

### 4. Routes:

-   `src/routes/v1/dashboard2/products.js` - Version 1
-   `src/routes/v2/dashboard2/products.js` - Version 2

## 🎯 Advanced Features

### 1. Filtering & Searching

```javascript
// Multiple filters
GET /products?category=Electronics&minPrice=1000000&search=gaming

// Advanced sorting
GET /products?sortBy=date_added&sortOrder=DESC&limit=20
```

### 2. Pagination

```javascript
// Page-based pagination
GET /products?page=2&limit=10

// Response includes pagination info
{
  "status": "success",
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

### 3. Validation

-   Automatic validation untuk required fields
-   Custom validation rules
-   Detailed error messages

### 4. Error Handling

-   Centralized error handling
-   Proper HTTP status codes
-   Detailed error responses

### 5. Logging

-   Winston logging untuk semua operations
-   File rotation untuk production
-   Request/response logging

## 🔧 Customization

### Menambah Field Baru

1. Update model `src/models/Product.js`
2. Push changes: `npm run db:push alter`
3. Update validation di `ProductController.js`

### Menambah Endpoint Baru

1. Tambah method di `ProductService.js`
2. Tambah handler di `ProductController.js`
3. Register route di `products.js`

### Membuat Model Baru

```bash
# Pull dari database (jika table sudah ada)
npm run db:pull

# Atau buat manual dan push
npm run db:push safe
```

## 📊 Monitoring

### Logs Location

-   `logs/combined-YYYY-MM-DD.log` - All logs
-   `logs/error-YYYY-MM-DD.log` - Error logs
-   `logs/access-YYYY-MM-DD.log` - Access logs

### Health Check

```bash
curl http://localhost:3000/health
```

## 🚨 Troubleshooting

### Database Connection Issues

```bash
# Check database status
npm run db:push status

# Test connection
npm run db:push models
```

### Model Sync Issues

```bash
# Force sync (will drop tables!)
npm run db:push force

# Safe sync
npm run db:push alter
```

### Port Already in Use

```bash
# Change port in .env
PORT=3001
```

---

**Happy Coding! 🚀**

Untuk dokumentasi API lengkap, lihat file `docs/API_PRODUCT.md`.
