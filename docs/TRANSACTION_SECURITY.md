# Transaction Security untuk API Product

## Overview

Implementasi transaksi telah ditambahkan ke API Product untuk memastikan keamanan data saat pengiriman dan operasi database. Semua operasi yang mengubah data (CREATE, UPDATE, DELETE) sekarang menggunakan database transactions dengan automatic rollback jika terjadi error.

## Features

### 1. Transaction Middleware

-   **transactionManager**: Middleware yang secara otomatis mengelola transaksi berdasarkan HTTP method dan response status
-   **withTransaction**: Wrapper function untuk controller methods yang memerlukan transaksi khusus
-   **executeInTransaction**: Utility function untuk menjalankan operasi dalam transaksi

### 2. Automatic Transaction Management

-   GET requests: Tidak menggunakan transaksi (read-only)
-   POST/PUT/PATCH/DELETE requests: Otomatis menggunakan transaksi
-   Success response (2xx): Transaksi di-commit
-   Error response (4xx/5xx): Transaksi di-rollback

### 3. Enhanced Security Features

-   **Data Integrity**: Semua operasi database dalam satu transaksi
-   **Automatic Rollback**: Jika ada error, semua perubahan dibatalkan
-   **Connection Safety**: Transaksi dibersihkan jika koneksi terputus
-   **Batch Operations**: Operasi batch dijamin konsistensi data

## API Endpoints dengan Transaction Support

### Basic Operations

```
POST /api/v1/dashboard2/products          # Create product
PUT /api/v1/dashboard2/products/:id       # Update product
DELETE /api/v1/dashboard2/products/:id    # Delete product
POST /api/v1/dashboard2/products/bulk     # Bulk create
```

### Advanced Batch Operations

```
PATCH /api/v1/dashboard2/products/batch/update       # Batch update
DELETE /api/v1/dashboard2/products/batch/delete      # Batch delete
PATCH /api/v1/dashboard2/products/transfer/category  # Transfer category
```

### V2 Enhanced Endpoints

```
POST /api/v2/dashboard2/products/bulk-import             # Enhanced bulk import
PATCH /api/v2/dashboard2/products/operations/batch-update      # Advanced batch update
DELETE /api/v2/dashboard2/products/operations/batch-delete     # Advanced batch delete
PATCH /api/v2/dashboard2/products/operations/transfer-category # Advanced category transfer
```

## Request Examples

### Batch Update Products

```json
PATCH /api/v1/dashboard2/products/batch/update
{
  "updates": [
    {
      "id": 1,
      "data": {
        "name": "Updated Product 1",
        "price": 99.99,
        "category_name": "Electronics"
      }
    },
    {
      "id": 2,
      "data": {
        "name": "Updated Product 2",
        "price": 149.99,
        "category_name": "Electronics"
      }
    }
  ]
}
```

### Batch Delete Products

```json
DELETE /api/v1/dashboard2/products/batch/delete
{
  "ids": [1, 2, 3, 4, 5]
}
```

### Transfer Products Between Categories

```json
PATCH /api/v1/dashboard2/products/transfer/category
{
  "productIds": [1, 2, 3],
  "newCategory": "Electronics"
}
```

### Bulk Create Products

```json
POST /api/v1/dashboard2/products/bulk
{
  "products": [
    {
      "name": "Product 1",
      "category_name": "Electronics",
      "price": 99.99
    },
    {
      "name": "Product 2",
      "category_name": "Books",
      "price": 19.99
    }
  ]
}
```

## Response Examples

### Success Response

```json
{
    "status": "success",
    "message": "3 products updated successfully",
    "data": [
        {
            "id_product": 1,
            "name": "Updated Product 1",
            "category_name": "Electronics",
            "price": "99.99",
            "date_added": "2024-01-01T00:00:00.000Z",
            "date_updated": "2024-01-02T00:00:00.000Z"
        }
    ]
}
```

### Error Response (with Rollback)

```json
{
    "status": "error",
    "message": "Validation failed for some products",
    "errors": [
        {
            "index": 1,
            "errors": ["Product name is required"]
        }
    ]
}
```

## Security Benefits

### 1. Data Consistency

-   Semua operasi dalam satu transaksi dijamin konsisten
-   Jika ada error di tengah proses, semua perubahan dibatalkan
-   Tidak ada partial updates yang bisa merusak integritas data

### 2. Error Recovery

-   Automatic rollback pada error database
-   Logging komprehensif untuk audit trail
-   Graceful handling untuk connection issues

### 3. Concurrent Access Protection

-   Database-level locking dengan transaksi
-   Isolation level dijaga untuk mencegah dirty reads
-   Race condition protection

### 4. Performance Optimization

-   Batch operations dioptimasi dalam satu transaksi
-   Reduced database round trips
-   Efficient resource utilization

## Logging

Setiap operasi transaksi akan dicatat dalam log dengan format:

```
[info]: Transaction committed for POST /api/v1/dashboard2/products with status 201
[warn]: Transaction rolled back for POST /api/v1/dashboard2/products with status 400
[error]: Transaction rolled back due to error: Validation failed
```

## Configuration

Transaksi menggunakan konfigurasi database yang sudah ada di `src/config/database.js`:

-   Connection pooling untuk efisiensi
-   Timeout handling
-   MySQL dialect dengan proper timezone support

## Best Practices

1. **Validation First**: Selalu validasi data sebelum memulai operasi database
2. **Batch Operations**: Gunakan batch endpoints untuk operasi multiple items
3. **Error Handling**: Pastikan error responses memberikan informasi yang memadai
4. **Monitoring**: Monitor log untuk transaction failures
5. **Testing**: Test dengan berbagai skenario error untuk memastikan rollback berfungsi

## Migration Guide

Untuk aplikasi yang sudah ada:

1. Import transaction middleware di routes
2. Apply `transactionManager` middleware ke routes yang diperlukan
3. Update controller methods untuk menggunakan `withTransaction` jika diperlukan
4. Test semua operasi CRUD untuk memastikan transaksi berfungsi

## Error Codes

-   **400**: Validation error (with rollback)
-   **404**: Resource not found (with rollback for write operations)
-   **500**: Database/server error (with rollback)
-   **2xx**: Success (transaction committed)
