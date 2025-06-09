# Authentication System Guide

## Deskripsi

Sistem autentikasi telah diimplementasikan menggunakan:

-   **Hashing Password**: SHA-1 dengan library `crypto-js`
-   **JWT Token**: untuk autentikasi dan otorisasi
-   **Middleware**: untuk melindungi route yang memerlukan autentikasi

## Instalasi Dependencies

```bash
npm install crypto-js jsonwebtoken
```

## Konfigurasi Environment

Pastikan file `.env` Anda memiliki konfigurasi berikut:

```env
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
```

## API Endpoints

### Authentication Endpoints

#### 1. Register User

-   **URL**: `POST /api/v1/dashboard1/auth/register`
-   **Body**:

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}
```

-   **Response Success**:

```json
{
    "status": "success",
    "message": "Registrasi berhasil",
    "data": {
        "user": {
            "id_user": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "date_added": "2024-01-01T00:00:00.000Z",
            "date_updated": "2024-01-01T00:00:00.000Z"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "token_type": "Bearer",
        "expires_in": "24h"
    }
}
```

#### 2. Login User

-   **URL**: `POST /api/v1/dashboard1/auth/login`
-   **Body**:

```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

-   **Response Success**:

```json
{
    "status": "success",
    "message": "Login berhasil",
    "data": {
        "user": {
            "id_user": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "date_added": "2024-01-01T00:00:00.000Z",
            "date_updated": "2024-01-01T00:00:00.000Z"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "token_type": "Bearer",
        "expires_in": "24h"
    }
}
```

#### 3. Logout User

-   **URL**: `POST /api/v1/dashboard1/auth/logout`
-   **Headers**:

```
Authorization: Bearer {your_jwt_token}
```

-   **Response Success**:

```json
{
    "status": "success",
    "message": "Logout berhasil",
    "data": null
}
```

#### 4. Get User Profile

-   **URL**: `GET /api/v1/dashboard1/auth/profile`
-   **Headers**:

```
Authorization: Bearer {your_jwt_token}
```

-   **Response Success**:

```json
{
    "status": "success",
    "message": "Profile user",
    "data": {
        "id_user": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "date_added": "2024-01-01T00:00:00.000Z",
        "date_updated": "2024-01-01T00:00:00.000Z"
    }
}
```

## Product API dengan Authentication

### Route yang Dilindungi Authentication

Route berikut memerlukan token JWT dalam header Authorization:

#### Create Operations

-   `POST /api/v1/dashboard2/products/` - Membuat produk baru
-   `POST /api/v1/dashboard2/products/bulk` - Membuat produk secara bulk

#### Update Operations

-   `PUT /api/v1/dashboard2/products/:id` - Update produk
-   `PATCH /api/v1/dashboard2/products/:id` - Update produk (partial)
-   `PATCH /api/v1/dashboard2/products/batch/update` - Update batch produk
-   `PATCH /api/v1/dashboard2/products/transfer/category` - Transfer kategori

#### Delete Operations

-   `DELETE /api/v1/dashboard2/products/:id` - Hapus produk
-   `DELETE /api/v1/dashboard2/products/batch/delete` - Hapus batch produk

### Route yang Tidak Memerlukan Authentication

Route berikut dapat diakses tanpa token (public):

#### Read Operations

-   `GET /api/v1/dashboard2/products/` - Ambil semua produk
-   `GET /api/v1/dashboard2/products/statistics` - Statistik produk
-   `GET /api/v1/dashboard2/products/categories` - Daftar kategori
-   `GET /api/v1/dashboard2/products/search/:term` - Cari produk
-   `GET /api/v1/dashboard2/products/category/:category` - Produk berdasarkan kategori
-   `GET /api/v1/dashboard2/products/price-range` - Produk berdasarkan range harga
-   `GET /api/v1/dashboard2/products/:id` - Detail produk

_Note: Route read menggunakan `optionalAuthMiddleware` yang akan menambahkan informasi user jika token tersedia._

## Cara Menggunakan Authentication

### 1. Login untuk mendapatkan token

```bash
curl -X POST http://localhost:3000/api/v1/dashboard1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Gunakan token untuk mengakses protected routes

```bash
curl -X POST http://localhost:3000/api/v1/dashboard2/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Produk Baru",
    "category": "Electronics",
    "price": 100000
  }'
```

## Testing

### Membuat Test User

Jalankan script untuk membuat test user:

```bash
npm run user:create-test
```

Ini akan membuat user dengan:

-   **Email**: test@example.com
-   **Password**: password123

### Manual Testing dengan Postman/cURL

1. **Register/Login** untuk mendapatkan token
2. **Copy token** dari response
3. **Gunakan token** di header Authorization untuk protected routes

## Error Responses

### Authentication Errors

#### Token Tidak Ditemukan

```json
{
    "status": "error",
    "message": "Token tidak ditemukan. Akses ditolak.",
    "data": null
}
```

#### Token Expired

```json
{
    "status": "error",
    "message": "Token sudah kedaluwarsa. Silakan login kembali.",
    "data": null
}
```

#### Token Invalid

```json
{
    "status": "error",
    "message": "Token tidak valid.",
    "data": null
}
```

#### User Tidak Ditemukan

```json
{
    "status": "error",
    "message": "User tidak ditemukan. Token tidak valid.",
    "data": null
}
```

### Login Errors

#### Email atau Password Salah

```json
{
    "status": "error",
    "message": "Email atau password salah",
    "data": null
}
```

#### Field Wajib Kosong

```json
{
    "status": "error",
    "message": "Email dan password wajib diisi",
    "data": null
}
```

## Security Features

1. **Password Hashing**: Menggunakan SHA-1 untuk hash password
2. **JWT Token**: Token yang expire dalam 24 jam (configurable)
3. **User Validation**: Memverifikasi user masih exist di database
4. **Authorization Header**: Menggunakan Bearer token format
5. **Optional Authentication**: Beberapa route dapat diakses dengan atau tanpa token

## File Structure

```
src/
├── controllers/
│   └── AuthController.js          # Controller untuk authentication
├── middlewares/
│   └── authMiddleware.js          # Middleware untuk proteksi route
├── routes/
│   └── v1/
│       ├── dashboard1/
│       │   └── auth.js           # Route authentication
│       └── dashboard2/
│           └── products.js       # Route products dengan auth
└── cli/
    └── create-test-user.js       # Script untuk membuat test user
```

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
JWT_EXPIRES_IN=24h
```

**Penting**: Ganti `JWT_SECRET` dengan string yang kuat dan unique untuk production!
