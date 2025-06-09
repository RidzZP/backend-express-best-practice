# SIPLAH Dashboard API Changelog

Semua perubahan penting pada API ini akan didokumentasikan dalam file ini.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
dan project ini mengikuti [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-03

### Added

-   ✨ **Swagger Documentation**: Dokumentasi API lengkap menggunakan OpenAPI 3.0
-   🔐 **Authentication Endpoints**: Login, register, logout, refresh token, profile management
-   📊 **Dashboard v1 Endpoints**: Overview dan analytics untuk Dashboard 1
-   📈 **Dashboard v2 Endpoints**: Reports generation dan management untuk Dashboard 2
-   📤 **Export Functionality**: Excel/CSV export dengan status tracking
-   🔧 **System Endpoints**: Health check, metrics, version info, system status
-   📮 **Postman Collection**: Auto-generated collection untuk testing
-   🛡️ **Security**: JWT authentication dan API key support
-   📄 **Response Standardization**: Format response yang konsisten
-   🔍 **Pagination**: Support untuk pagination di semua list endpoints
-   📝 **Comprehensive Documentation**: README dan guides lengkap

### Security

-   🔒 **JWT Authentication**: Secure token-based authentication
-   🛡️ **Rate Limiting**: Protection terhadap abuse
-   🔐 **Input Validation**: Comprehensive request validation
-   🚫 **SQL Injection Protection**: Sequelize ORM dengan prepared statements

### Documentation Structure

```
docs/
├── swagger/
│   ├── authentication.yaml    # Auth endpoints
│   ├── dashboard.yaml         # Dashboard endpoints
│   ├── export.yaml           # Export endpoints
│   └── system.yaml           # System endpoints
├── README.md                 # Main documentation
└── CHANGELOG.md             # This file
```

### API Endpoints Summary

#### Authentication (`/api/v1/auth/`)

-   `POST /login` - User login
-   `POST /register` - User registration
-   `POST /logout` - User logout
-   `POST /refresh` - Refresh access token
-   `GET /profile` - Get user profile
-   `PUT /profile` - Update user profile

#### Dashboard 1 (`/api/v1/dashboard1/`)

-   `GET /overview` - Dashboard overview data
-   `GET /analytics` - Analytics data with pagination

#### Dashboard 2 (`/api/v2/dashboard2/`)

-   `GET /reports` - Get reports list
-   `POST /reports` - Generate custom report
-   `GET /reports/{reportId}/status` - Check report status

#### Export (`/api/export/`)

-   `POST /excel` - Export data to Excel/CSV
-   `GET /{exportId}/status` - Check export status
-   `GET /{exportId}/download` - Download export file
-   `POST /{exportId}/cancel` - Cancel export operation
-   `GET /history` - Get export history

#### System (`/api/`)

-   `GET /health` - Health check
-   `GET /metrics` - System metrics (auth required)
-   `GET /version` - API version info
-   `GET /status` - Detailed system status (auth required)

### Configuration

-   **Swagger UI**: Available at `/docs`
-   **API Spec**: Available at `/api-docs.json`
-   **Postman Collection**: Available at `/postman-collection.json`
-   **Base URL**: Configurable via environment variables
-   **Database Logging**: Disabled untuk menghilangkan noise di logs

### Breaking Changes

-   None (initial release)

### Migration Guide

-   None (initial release)

---

## Template untuk Release Selanjutnya

### [Unreleased]

#### Added

-   New features

#### Changed

-   Changes in existing functionality

#### Deprecated

-   Soon-to-be removed features

#### Removed

-   Now removed features

#### Fixed

-   Bug fixes

#### Security

-   Security improvements

---

## Versioning Strategy

-   **Major version** (X.0.0): Breaking changes
-   **Minor version** (0.X.0): New features, backward compatible
-   **Patch version** (0.0.X): Bug fixes, backward compatible

## Support Policy

-   **Current version**: Full support
-   **Previous major version**: Security fixes only
-   **Older versions**: No support

## Links

-   [API Documentation](http://localhost:3000/docs)
-   [Postman Collection](http://localhost:3000/postman-collection.json)
-   [Health Check](http://localhost:3000/api/health)
