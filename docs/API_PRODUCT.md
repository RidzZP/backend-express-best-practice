# Product API Documentation

API documentation untuk CRUD operations Product di aplikasi Express MVC Template.

## Base URLs

-   **Version 1:** `/api/v1/dashboard2/products`
-   **Version 2:** `/api/v2/dashboard2/products`

## Model Structure

```javascript
{
  id_product: INTEGER (Primary Key, Auto Increment),
  name: STRING(255) (Required),
  category_name: STRING(255) (Required),
  price: DECIMAL(10,2) (Required),
  date_added: DATE (Auto-generated),
  date_updated: DATE (Auto-generated)
}
```

---

## Endpoints

### 1. Get All Products

**GET** `/products`

Mendapatkan semua produk dengan pagination dan filtering.

#### Query Parameters:

-   `page` (integer): Halaman (default: 1)
-   `limit` (integer): Jumlah per halaman (default: 10)
-   `category` (string): Filter berdasarkan kategori
-   `search` (string): Pencarian berdasarkan nama produk
-   `minPrice` (decimal): Harga minimum
-   `maxPrice` (decimal): Harga maksimum
-   `sortBy` (string): Kolom untuk sorting (default: date_added)
-   `sortOrder` (string): ASC atau DESC (default: DESC)

#### Example Request:

```bash
GET /api/v1/dashboard2/products?page=1&limit=5&category=Electronics&sortBy=price&sortOrder=ASC
```

#### Example Response:

```json
{
    "status": "success",
    "data": [
        {
            "id_product": 1,
            "name": "Laptop Gaming",
            "category_name": "Electronics",
            "price": "15000000.00",
            "date_added": "2024-01-15T10:30:00.000Z",
            "date_updated": "2024-01-15T10:30:00.000Z"
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 5,
        "total": 25,
        "totalPages": 5
    }
}
```

---

### 2. Get Product by ID

**GET** `/products/:id`

Mendapatkan detail produk berdasarkan ID.

#### Example Request:

```bash
GET /api/v1/dashboard2/products/1
```

#### Example Response:

```json
{
    "status": "success",
    "data": {
        "id_product": 1,
        "name": "Laptop Gaming",
        "category_name": "Electronics",
        "price": "15000000.00",
        "date_added": "2024-01-15T10:30:00.000Z",
        "date_updated": "2024-01-15T10:30:00.000Z"
    }
}
```

---

### 3. Create Product

**POST** `/products`

Membuat produk baru.

#### Request Body:

```json
{
    "name": "Smartphone Premium",
    "category_name": "Electronics",
    "price": 8500000
}
```

#### Example Response:

```json
{
    "status": "success",
    "message": "Product created successfully",
    "data": {
        "id_product": 2,
        "name": "Smartphone Premium",
        "category_name": "Electronics",
        "price": "8500000.00",
        "date_added": "2024-01-15T11:00:00.000Z",
        "date_updated": "2024-01-15T11:00:00.000Z"
    }
}
```

---

### 4. Update Product

**PUT/PATCH** `/products/:id`

Mengupdate produk yang sudah ada.

#### Request Body:

```json
{
    "name": "Smartphone Premium Updated",
    "category_name": "Electronics",
    "price": 9000000
}
```

#### Example Response:

```json
{
    "status": "success",
    "message": "Product updated successfully",
    "data": {
        "id_product": 2,
        "name": "Smartphone Premium Updated",
        "category_name": "Electronics",
        "price": "9000000.00",
        "date_added": "2024-01-15T11:00:00.000Z",
        "date_updated": "2024-01-15T11:15:00.000Z"
    }
}
```

---

### 5. Delete Product

**DELETE** `/products/:id`

Menghapus produk.

#### Example Request:

```bash
DELETE /api/v1/dashboard2/products/2
```

#### Example Response:

```json
{
    "status": "success",
    "message": "Record deleted successfully"
}
```

---

### 6. Search Products

**GET** `/products/search/:term`

Mencari produk berdasarkan nama.

#### Example Request:

```bash
GET /api/v1/dashboard2/products/search/laptop
```

#### Example Response:

```json
{
    "status": "success",
    "data": [
        {
            "id_product": 1,
            "name": "Laptop Gaming",
            "category_name": "Electronics",
            "price": "15000000.00",
            "date_added": "2024-01-15T10:30:00.000Z",
            "date_updated": "2024-01-15T10:30:00.000Z"
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 1,
        "totalPages": 1
    }
}
```

---

### 7. Get Products by Category

**GET** `/products/category/:category`

Mendapatkan produk berdasarkan kategori.

#### Example Request:

```bash
GET /api/v1/dashboard2/products/category/Electronics
```

---

### 8. Get Products by Price Range

**GET** `/products/price-range`

Mendapatkan produk berdasarkan rentang harga.

#### Query Parameters:

-   `minPrice` (decimal): Harga minimum
-   `maxPrice` (decimal): Harga maksimum

#### Example Request:

```bash
GET /api/v1/dashboard2/products/price-range?minPrice=5000000&maxPrice=10000000
```

---

### 9. Get All Categories

**GET** `/products/categories`

Mendapatkan semua kategori produk yang ada.

#### Example Response:

```json
{
    "status": "success",
    "data": ["Electronics", "Fashion", "Books", "Home & Garden", "Sports"]
}
```

---

### 10. Get Product Statistics

**GET** `/products/statistics`

Mendapatkan statistik produk.

#### Example Response:

```json
{
    "status": "success",
    "data": {
        "totalProducts": 150,
        "totalCategories": 5,
        "averagePrice": 2500000,
        "minPrice": 50000,
        "maxPrice": 25000000
    }
}
```

---

### 11. Bulk Create Products

**POST** `/products/bulk`

Membuat banyak produk sekaligus.

#### Request Body:

```json
{
    "products": [
        {
            "name": "Product 1",
            "category_name": "Electronics",
            "price": 1000000
        },
        {
            "name": "Product 2",
            "category_name": "Fashion",
            "price": 500000
        }
    ]
}
```

#### Example Response:

```json
{
    "status": "success",
    "message": "2 products created successfully",
    "data": [
        {
            "id_product": 3,
            "name": "Product 1",
            "category_name": "Electronics",
            "price": "1000000.00",
            "date_added": "2024-01-15T12:00:00.000Z",
            "date_updated": "2024-01-15T12:00:00.000Z"
        },
        {
            "id_product": 4,
            "name": "Product 2",
            "category_name": "Fashion",
            "price": "500000.00",
            "date_added": "2024-01-15T12:00:00.000Z",
            "date_updated": "2024-01-15T12:00:00.000Z"
        }
    ]
}
```

---

## API Version 2 Differences

API Version 2 (`/api/v2/dashboard2/products`) memiliki beberapa perbedaan endpoint:

-   `/analytics/statistics` - Statistik produk (sama dengan v1 `/statistics`)
-   `/metadata/categories` - Kategori produk (sama dengan v1 `/categories`)
-   `/filter/category/:category` - Filter berdasarkan kategori
-   `/filter/price-range` - Filter berdasarkan harga
-   `/bulk-import` - Bulk create (sama dengan v1 `/bulk`)

---

## Error Responses

### Validation Error

```json
{
    "status": "error",
    "message": "Validation failed",
    "errors": ["Product name is required", "Valid price is required"]
}
```

### Not Found Error

```json
{
    "status": "error",
    "message": "Product not found"
}
```

### Server Error

```json
{
    "status": "error",
    "message": "Failed to retrieve product"
}
```

---

## Usage Examples

### JavaScript/Fetch

```javascript
// Get all products
const response = await fetch("/api/v1/dashboard2/products");
const products = await response.json();

// Create new product
const newProduct = await fetch("/api/v1/dashboard2/products", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        name: "New Product",
        category_name: "Electronics",
        price: 1500000,
    }),
});

// Search products
const searchResults = await fetch("/api/v1/dashboard2/products/search/laptop");
```

### cURL

```bash
# Get all products
curl -X GET "http://localhost:3000/api/v1/dashboard2/products"

# Create product
curl -X POST "http://localhost:3000/api/v1/dashboard2/products" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","category_name":"Electronics","price":1000000}'

# Update product
curl -X PUT "http://localhost:3000/api/v1/dashboard2/products/1" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Product","category_name":"Electronics","price":1200000}'

# Delete product
curl -X DELETE "http://localhost:3000/api/v1/dashboard2/products/1"
```
