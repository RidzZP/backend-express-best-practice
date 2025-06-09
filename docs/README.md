# SIPLAH Dashboard API Documentation

Dokumentasi API yang komprehensif untuk sistem SIPLAH Dashboard menggunakan Swagger/OpenAPI 3.0.

## 📋 Daftar Isi

-   [Akses Dokumentasi](#akses-dokumentasi)
-   [Struktur Dokumentasi](#struktur-dokumentasi)
-   [Endpoint Categories](#endpoint-categories)
-   [Authentication](#authentication)
-   [Instalasi Dependencies](#instalasi-dependencies)
-   [Penggunaan](#penggunaan)
-   [Postman Collection](#postman-collection)

## 🌐 Akses Dokumentasi

### Swagger UI (Interactive Documentation)

```
http://localhost:3000/docs
```

### API Specification (JSON)

```
http://localhost:3000/api-docs.json
```

### Documentation Index

```
http://localhost:3000/
```

### Postman Collection

```
http://localhost:3000/postman-collection.json
```

## 📁 Struktur Dokumentasi

Dokumentasi API diorganisir dalam file-file terpisah untuk kemudahan maintenance:

```
docs/
├── swagger/
│   ├── authentication.yaml    # Endpoint autentikasi
│   ├── dashboard.yaml         # Endpoint dashboard
│   ├── export.yaml           # Endpoint export data
│   └── system.yaml           # Endpoint sistem & monitoring
├── README.md                 # Dokumentasi ini
└── CHANGELOG.md             # Riwayat perubahan API
```

## 🏷️ Endpoint Categories

### 1. Authentication

-   **Login** - `POST /api/v1/auth/login`
-   **Register** - `POST /api/v1/auth/register`
-   **Logout** - `POST /api/v1/auth/logout`
-   **Refresh Token** - `POST /api/v1/auth/refresh`
-   **Get Profile** - `GET /api/v1/auth/profile`
-   **Update Profile** - `PUT /api/v1/auth/profile`

### 2. Dashboard 1 (v1)

-   **Overview** - `GET /api/v1/dashboard1/overview`
-   **Analytics** - `GET /api/v1/dashboard1/analytics`

### 3. Dashboard 2 (v2)

-   **Reports** - `GET /api/v2/dashboard2/reports`
-   **Generate Report** - `POST /api/v2/dashboard2/reports`
-   **Report Status** - `GET /api/v2/dashboard2/reports/{reportId}/status`

### 4. Export

-   **Export to Excel** - `POST /api/export/excel`
-   **Export Status** - `GET /api/export/{exportId}/status`
-   **Download Export** - `GET /api/export/{exportId}/download`
-   **Cancel Export** - `POST /api/export/{exportId}/cancel`
-   **Export History** - `GET /api/export/history`

### 5. System

-   **Health Check** - `GET /api/health`
-   **System Metrics** - `GET /api/metrics`
-   **Version Info** - `GET /api/version`
-   **System Status** - `GET /api/status`

## 🔐 Authentication

API menggunakan JWT (JSON Web Token) untuk autentikasi:

### Bearer Token

```http
Authorization: Bearer <your-jwt-token>
```

### API Key (Alternative)

```http
X-API-KEY: <your-api-key>
```

### Mendapatkan Token

1. Login menggunakan endpoint `/api/v1/auth/login`
2. Gunakan token yang diterima untuk request selanjutnya
3. Refresh token jika diperlukan menggunakan `/api/v1/auth/refresh`

## 📦 Instalasi Dependencies

Untuk menggunakan dokumentasi Swagger, install dependencies berikut:

```bash
npm install swagger-jsdoc swagger-ui-express --save
```

Dependencies sudah termasuk dalam `package.json` jika Anda menggunakan project ini.

## 🚀 Penggunaan

### 1. Menjalankan Server

```bash
npm start
# atau untuk development
npm run dev
```

### 2. Akses Dokumentasi

Buka browser dan kunjungi:

-   **Swagger UI**: http://localhost:3000/docs
-   **API Spec**: http://localhost:3000/api-docs.json

### 3. Testing API

1. Gunakan Swagger UI untuk testing interaktif
2. Atau download Postman collection dari `/postman-collection.json`
3. Import collection ke Postman dan mulai testing

### 4. Authentication Flow

```javascript
// 1. Login
POST /api/v1/auth/login
{
  "login": "user@example.com",
  "password": "password123"
}

// 2. Gunakan token untuk request lain
GET /api/v1/dashboard1/overview
Authorization: Bearer <token-dari-login>
```

## 📮 Postman Collection

Download Postman collection yang sudah dikonfigurasi:

```bash
curl -o SIPLAH_API.postman_collection.json \
  http://localhost:3000/postman-collection.json
```

Collection ini sudah termasuk:

-   ✅ Environment variables (baseUrl, token)
-   ✅ Authentication setup
-   ✅ Sample requests untuk semua endpoints
-   ✅ Pre-configured headers

### Import ke Postman

1. Buka Postman
2. Click **Import**
3. Pilih file `SIPLAH_API.postman_collection.json`
4. Set environment variable `baseUrl` ke `http://localhost:3000`
5. Login dan copy token ke variable `token`

## 🔧 Konfigurasi

### Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000
PROD_URL=https://api.siplah.com

# API Configuration
API_PREFIX=/api
API_VERSION_1=/v1
API_VERSION_2=/v2

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=siplah_dashboard
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### Swagger Configuration

File konfigurasi Swagger ada di `src/config/swagger.js`:

```javascript
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SIPLAH Dashboard API",
            version: "1.0.0",
            description: "Comprehensive API documentation",
        },
        servers: [
            {
                url: process.env.BASE_URL || "http://localhost:3000",
                description: "Development server",
            },
        ],
    },
    apis: ["./src/routes/**/*.js", "./src/controllers/**/*.js", "./docs/swagger/*.yaml"],
};
```

## 📝 Response Format

Semua API response menggunakan format standar:

### Success Response

```json
{
    "status": "success",
    "message": "Operation completed successfully",
    "data": {
        // Response data here
    },
    "timestamp": "2025-01-03T10:30:00Z"
}
```

### Error Response

```json
{
    "status": "error",
    "message": "Error description",
    "error_code": "ERR_001",
    "timestamp": "2025-01-03T10:30:00Z"
}
```

### Paginated Response

```json
{
  "status": "success",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": "2025-01-03T10:30:00Z"
}
```

## 🛠️ Development

### Menambah Endpoint Baru

1. Buat endpoint di controller/route
2. Tambahkan dokumentasi di file YAML yang sesuai
3. Update Postman collection jika diperlukan

### Update Dokumentasi

1. Edit file YAML di `docs/swagger/`
2. Restart server untuk melihat perubahan
3. Verifikasi di Swagger UI

## 📞 Support

Untuk bantuan atau pertanyaan:

-   **Email**: support@siplah.com
-   **Documentation**: http://localhost:3000/docs
-   **API Status**: http://localhost:3000/api/health

## 📄 License

MIT License - Lihat file LICENSE untuk detail lengkap.
