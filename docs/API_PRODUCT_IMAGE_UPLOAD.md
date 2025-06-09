# Product Image Upload API Documentation

API documentation untuk file upload gambar produk di aplikasi Express MVC Template.

## Base URLs

-   **Version 1:** `/api/v1/dashboard2/products`
-   **Version 2:** `/api/v2/dashboard2/products`

## Fitur

-   Upload gambar untuk produk (format: JPG, PNG, GIF, WebP)
-   Maksimal ukuran file: 5MB
-   Gambar disimpan di direktori `public/image/product/`
-   Path gambar disimpan ke database pada kolom `foto`
-   Auto-delete gambar lama saat update produk
-   Auto-delete gambar saat hapus produk

---

## Endpoints

### 1. Create Product dengan Upload Gambar

**POST** `/products/with-image`

Membuat produk baru dengan upload gambar.

#### Headers:

```
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>
```

#### Form Data:

-   `name` (string, required): Nama produk
-   `category_name` (string, required): Nama kategori
-   `price` (decimal, required): Harga produk
-   `foto` (file, optional): File gambar (JPG, PNG, GIF, WebP, max 5MB)

#### Example Request (cURL):

```bash
curl -X POST "http://localhost:3000/api/v1/dashboard2/products/with-image" \
  -H "Authorization: Bearer <jwt_token>" \
  -F "name=Laptop Gaming" \
  -F "category_name=Electronics" \
  -F "price=15000000" \
  -F "foto=@/path/to/image.jpg"
```

#### Example Response:

```json
{
    "status": "success",
    "message": "Product with image created successfully",
    "data": {
        "id_product": 1,
        "name": "Laptop Gaming",
        "category_name": "Electronics",
        "price": "15000000.00",
        "foto": "/image/product/product-1703123456789-123456789.jpg",
        "date_added": "2024-01-15T10:30:00.000Z",
        "date_updated": "2024-01-15T10:30:00.000Z"
    }
}
```

---

### 2. Update Product dengan Upload Gambar

**PUT** `/products/:id/with-image`

Update produk dengan upload gambar baru.

#### Headers:

```
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>
```

#### Form Data:

-   `name` (string, required): Nama produk
-   `category_name` (string, required): Nama kategori
-   `price` (decimal, required): Harga produk
-   `foto` (file, optional): File gambar baru (JPG, PNG, GIF, WebP, max 5MB)

#### Example Request (cURL):

```bash
curl -X PUT "http://localhost:3000/api/v1/dashboard2/products/1/with-image" \
  -H "Authorization: Bearer <jwt_token>" \
  -F "name=Laptop Gaming Updated" \
  -F "category_name=Electronics" \
  -F "price=16000000" \
  -F "foto=@/path/to/new-image.jpg"
```

#### Example Response:

```json
{
    "status": "success",
    "message": "Product with image updated successfully",
    "data": {
        "id_product": 1,
        "name": "Laptop Gaming Updated",
        "category_name": "Electronics",
        "price": "16000000.00",
        "foto": "/image/product/product-1703123999999-987654321.jpg",
        "date_added": "2024-01-15T10:30:00.000Z",
        "date_updated": "2024-01-15T11:00:00.000Z"
    }
}
```

---

### 3. Mengakses Gambar yang Diupload

**GET** `/image/product/<filename>`

Mengakses gambar produk yang telah diupload.

#### Example:

```
http://localhost:3000/image/product/product-1703123456789-123456789.jpg
```

---

## Error Responses

### 1. File Size Too Large

```json
{
    "status": "error",
    "message": "File too large. Maximum size is 5MB."
}
```

### 2. Invalid File Type

```json
{
    "status": "error",
    "message": "Only image files are allowed!"
}
```

### 3. Validation Error

```json
{
    "status": "error",
    "message": "Validation failed",
    "errors": ["Product name is required", "Valid price is required"]
}
```

### 4. Upload Error

```json
{
    "status": "error",
    "message": "Upload error: <error_details>"
}
```

---

## JavaScript/Frontend Examples

### 1. Menggunakan Fetch API

```javascript
// Create product with image
const formData = new FormData();
formData.append("name", "Laptop Gaming");
formData.append("category_name", "Electronics");
formData.append("price", "15000000");
formData.append("foto", fileInput.files[0]); // file input element

const response = await fetch("/api/v1/dashboard2/products/with-image", {
    method: "POST",
    headers: {
        Authorization: "Bearer " + token,
    },
    body: formData,
});

const result = await response.json();
console.log(result);
```

### 2. Menggunakan Axios

```javascript
// Update product with image
const formData = new FormData();
formData.append("name", "Updated Product Name");
formData.append("category_name", "Electronics");
formData.append("price", "16000000");
formData.append("foto", fileInput.files[0]);

try {
    const response = await axios.put(
        `/api/v1/dashboard2/products/${productId}/with-image`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: "Bearer " + token,
            },
        }
    );

    console.log("Success:", response.data);
} catch (error) {
    console.error("Error:", error.response.data);
}
```

### 3. HTML Form Example

```html
<form
    action="/api/v1/dashboard2/products/with-image"
    method="POST"
    enctype="multipart/form-data"
>
    <input type="text" name="name" placeholder="Product Name" required />
    <input type="text" name="category_name" placeholder="Category" required />
    <input type="number" name="price" placeholder="Price" step="0.01" required />
    <input type="file" name="foto" accept="image/*" />
    <button type="submit">Create Product</button>
</form>
```

---

## Catatan Penting

1. **Authentication Required**: Semua endpoint memerlukan JWT token untuk v1, v2 tidak memerlukan auth
2. **File Cleanup**: Sistem otomatis menghapus file lama saat update/delete produk
3. **Validation**: File harus berupa gambar dan maksimal 5MB
4. **Naming Convention**: File otomatis dinamai dengan format: `product-{timestamp}-{random}.{ext}`
5. **Directory Structure**: Gambar disimpan di `public/image/product/`
6. **Database**: Hanya path relatif yang disimpan di database, bukan file binary

---

## Troubleshooting

### Problem: "multer is not installed"

**Solution**: Install multer dependency

```bash
npm install multer
```

### Problem: "Cannot upload file"

**Solution**: Pastikan:

-   Directory `public/image/product/` dapat ditulis
-   File size tidak melebihi 5MB
-   File format adalah gambar yang valid

### Problem: "Image not accessible"

**Solution**: Pastikan static middleware sudah dikonfigurasi untuk serve `/image` route
