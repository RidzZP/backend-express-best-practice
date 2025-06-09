# Upload Middleware Guide

Panduan lengkap untuk menggunakan upload middleware yang reusable dengan compression dan validasi.

## Fitur

-   ✅ **Reusable Configuration** - Dapat dikonfigurasi untuk berbagai kebutuhan
-   ✅ **Image Compression** - Otomatis compress gambar menggunakan Sharp
-   ✅ **Format Validation** - Validasi format gambar yang didukung
-   ✅ **Size Limit** - Pembatasan ukuran file (default 2MB)
-   ✅ **Auto Directory Creation** - Otomatis membuat direktori jika belum ada
-   ✅ **Multiple Upload Support** - Mendukung single dan multiple file upload

## Supported Formats

-   **JPEG** (.jpg, .jpeg)
-   **PNG** (.png)
-   **WebP** (.webp)
-   **GIF** (.gif)

## Basic Usage

### 1. Import Middleware

```javascript
const {
    createUploadMiddleware,
    productImageUpload,
} = require("../middlewares/uploadMiddleware");
```

### 2. Pre-configured Middlewares

```javascript
// Product images (2MB, quality 85%)
const { productImageUpload } = require("../middlewares/uploadMiddleware");
router.post("/products", productImageUpload.single, controller.create);

// User avatars (1MB, 512x512, quality 90%)
const { userAvatarUpload } = require("../middlewares/uploadMiddleware");
router.post("/users", userAvatarUpload.single, controller.create);

// Category images (2MB, quality 80%)
const { categoryImageUpload } = require("../middlewares/uploadMiddleware");
router.post("/categories", categoryImageUpload.single, controller.create);
```

### 3. Custom Configuration

```javascript
const { createUploadMiddleware } = require("../middlewares/uploadMiddleware");

// Custom upload middleware
const customUpload = createUploadMiddleware({
    destination: "public/image/custom",
    fieldName: "image",
    maxFileSize: 5 * 1024 * 1024, // 5MB
    compress: true,
    quality: 70,
    maxWidth: 2048,
    maxHeight: 2048,
});

router.post("/custom", customUpload.single, controller.create);
```

## Configuration Options

| Option        | Type    | Default                  | Description                   |
| ------------- | ------- | ------------------------ | ----------------------------- |
| `destination` | string  | `'public/image/general'` | Upload directory path         |
| `fieldName`   | string  | `'image'`                | Form field name               |
| `maxFileSize` | number  | `2 * 1024 * 1024`        | Max file size in bytes (2MB)  |
| `maxFiles`    | number  | `1`                      | Max files for multiple upload |
| `compress`    | boolean | `true`                   | Enable image compression      |
| `quality`     | number  | `80`                     | Compression quality (1-100)   |
| `maxWidth`    | number  | `1920`                   | Max width for resize          |
| `maxHeight`   | number  | `1080`                   | Max height for resize         |

## Examples

### Single File Upload

```javascript
// Route
router.post("/upload", productImageUpload.single, (req, res) => {
    // File path akan tersedia di req.body.foto
    console.log("Uploaded file path:", req.body.foto);
    // Output: /image/product/img-1234567890-123456789.jpg
});
```

### Multiple Files Upload

```javascript
const multiUpload = createUploadMiddleware({
    destination: "public/image/gallery",
    fieldName: "images",
    maxFiles: 5,
    maxFileSize: 3 * 1024 * 1024, // 3MB per file
});

router.post("/gallery", multiUpload.multiple, (req, res) => {
    // File paths akan tersedia di req.body.images (array)
    console.log("Uploaded files:", req.body.images);
    // Output: ['/image/gallery/img-123.jpg', '/image/gallery/img-456.jpg']
});
```

### Custom Validation

```javascript
const strictUpload = createUploadMiddleware({
    destination: "public/image/documents",
    fieldName: "document",
    maxFileSize: 1 * 1024 * 1024, // 1MB only
    compress: false, // No compression for documents
    quality: 100,
});
```

## Frontend Integration

### HTML Form

```html
<form action="/api/v1/products" method="POST" enctype="multipart/form-data">
    <input type="text" name="name" required />
    <input type="text" name="category_name" required />
    <input type="number" name="price" required />
    <input type="file" name="foto" accept="image/*" />
    <button type="submit">Upload</button>
</form>
```

### JavaScript Fetch

```javascript
const formData = new FormData();
formData.append("name", "Product Name");
formData.append("category_name", "Electronics");
formData.append("price", "100000");
formData.append("foto", fileInput.files[0]);

fetch("/api/v1/products", {
    method: "POST",
    body: formData,
})
    .then((response) => response.json())
    .then((data) => console.log(data));
```

### React Example

```jsx
const [file, setFile] = useState(null);

const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("category_name", category);
    formData.append("price", price);
    formData.append("foto", file);

    try {
        const response = await fetch("/api/v1/products", {
            method: "POST",
            body: formData,
        });
        const result = await response.json();
        console.log("Success:", result);
    } catch (error) {
        console.error("Error:", error);
    }
};
```

## Error Handling

### Common Errors

```json
// File too large
{
    "status": "error",
    "message": "File too large. Maximum size is 2MB."
}

// Invalid file type
{
    "status": "error",
    "message": "Invalid file type. Supported formats: jpg, jpeg, png, webp, gif"
}

// Processing error
{
    "status": "error",
    "message": "Error processing uploaded image"
}
```

### Error Handling in Controller

```javascript
const handleUpload = async (req, res) => {
    try {
        // req.body.foto akan berisi path file yang sudah diupload
        const productData = {
            name: req.body.name,
            category_name: req.body.category_name,
            price: req.body.price,
            foto: req.body.foto, // Path gambar
        };

        const product = await ProductService.create(productData);

        res.json({
            status: "success",
            data: product,
        });
    } catch (error) {
        // Jika terjadi error, file akan otomatis dihapus
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};
```

## File Management

### Auto Cleanup

Middleware otomatis menghapus file jika:

-   Validasi gagal
-   Database operation gagal
-   Processing error

### Manual File Deletion

```javascript
const { deleteUploadedFile } = require("../middlewares/uploadMiddleware");

// Hapus file berdasarkan path
const deleted = deleteUploadedFile("/image/product/img-123456789.jpg");
console.log("File deleted:", deleted); // true/false
```

## Directory Structure

```
public/
├── image/
│   ├── product/          # Product images
│   ├── avatar/           # User avatars
│   ├── category/         # Category images
│   └── custom/           # Custom uploads
```

## Performance Tips

1. **Compression Settings**

    - Gunakan quality 85-90 untuk foto produk
    - Gunakan quality 70-80 untuk gambar umum
    - Disable compression untuk dokumen

2. **Size Limits**

    - 1MB untuk avatar
    - 2MB untuk produk
    - 5MB untuk gallery

3. **Format Recommendations**
    - JPEG untuk foto
    - PNG untuk logo/icon
    - WebP untuk web modern

## Advanced Usage

### Custom Processing

```javascript
const advancedUpload = createUploadMiddleware({
    destination: "public/image/advanced",
    fieldName: "photo",
    compress: true,
    quality: 85,
    maxWidth: 1200,
    maxHeight: 800,
    // Custom processing bisa ditambahkan di controller
});
```

### Conditional Compression

```javascript
// Disable compression untuk file kecil
const smartUpload = createUploadMiddleware({
    destination: "public/image/smart",
    fieldName: "image",
    compress: true, // Will be handled in processImage
    quality: 80,
});
```

## Troubleshooting

### Problem: "sharp is not installed"

```bash
npm install sharp
```

### Problem: "Directory permission denied"

```bash
# Pastikan direktori dapat ditulis
chmod 755 public/image/
```

### Problem: "File not uploading"

-   Periksa `enctype="multipart/form-data"` di form
-   Pastikan field name sesuai dengan konfigurasi
-   Cek ukuran file tidak melebihi limit

### Problem: "Image quality poor"

-   Tingkatkan quality setting (80-95)
-   Sesuaikan maxWidth/maxHeight
-   Pertimbangkan disable compression untuk kualitas maksimal
