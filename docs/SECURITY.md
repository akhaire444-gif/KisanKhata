# KisanKhata Application Security & Hardening Policy

## 1. Authentication & Session Security
- **Hashing:** Passwords hashed with BCrypt (12 rounds) with individual salts.
- **Session Protection:**
  - Standard cookie name: `JSESSIONID`
  - Flags: `HttpOnly = true`, `Secure = true` (in production/HTTPS), `SameSite = Lax`.
  - Max concurrent sessions per user: 3.
  - Session inactivity timeout: 30 minutes (`server.servlet.session.timeout=30m`).
- **Brute Force Rate Limiting:**
  - Track failed login attempts by email address.
  - 5 failed attempts in 10 minutes locks login for that email for 10 minutes (`FR-AUTH-06`).
  - Constant-time verification prevents username enumeration timing attacks.

## 2. Authorization & Tenant Isolation
- **Role-Based Access Control (RBAC):**
  - `/api/v1/auth/**`: Public (register, login, csrf, health).
  - `/api/v1/farmer/**`: Requires `ROLE_FARMER`.
  - `/api/v1/mart/**`: Public browsing, `ROLE_BUYER` for cart/checkout/orders.
  - `/api/v1/admin/**`: Requires `ROLE_ADMIN`.
- **Object-Level Tenant Isolation:**
  - Request bodies and URL paths containing `farmerId` or `buyerId` are never trusted.
  - The security context principal is the single source of truth:
    `String currentUserId = SecurityUtils.getCurrentUserId();`
  - All JPA queries strictly filter by `id = :id AND farmerId = :currentUserId`.

## 3. Cross-Site Request Forgery (CSRF)
- Spring Security CSRF filter enabled using `CookieCsrfTokenRepository.withHttpOnlyFalse()`.
- Safe methods (`GET`, `HEAD`, `OPTIONS`, `TRACE`) require no token.
- Mutating methods (`POST`, `PUT`, `PATCH`, `DELETE`) require header `X-XSRF-TOKEN` matching cookie `XSRF-TOKEN`.
- Public endpoints (`/api/v1/auth/register`, `/api/v1/auth/register-buyer`, `/api/v1/auth/login`, `/actuator/health`) are specifically handled or exempted from CSRF checks before initial authentication.

## 4. Cross-Origin Resource Sharing (CORS)
- Strict origin whitelist controlled by environment variable `app.cors.allowed-origin` (default: `http://localhost:5173` or production domain).
- Credentials supported: `allowCredentials(true)`.
- Disallow wildcard `*` with credentials in production.

## 5. Input Validation & SQL Injection Prevention
- All user input validated with Jakarta Bean Validation (`@NotBlank`, `@Size`, `@Pattern`, `@DecimalMin`, `@NotNull`, `@Email`).
- No raw string concatenation in SQL/HQL. All queries use Spring Data JPA derived queries or parameterized `@Query` annotations.

## 6. File Upload Security
- Dedicated directory outside the executable web root (`./data/uploads`).
- Allowed MIME types: `image/jpeg`, `image/png`.
- Allowed extensions: `.jpg`, `.jpeg`, `.png`.
- Magic byte verification: inspect file header bytes to confirm actual image structure, not just extension.
- File size limit: 1 MB (`spring.servlet.multipart.max-file-size=1MB`).
- Storage naming: UUID filenames (`UUID.randomUUID().toString() + extension`) to prevent directory traversal (`../`) and file overwrite attacks.
- Non-executable: uploads directory served as static binary assets with `Content-Disposition: inline` and strict `X-Content-Type-Options: nosniff`.

## 7. Audit Logging of Sensitive Operations
The following actions must be persisted immutably in `audit_logs`:
1. Order marked as `PAID` or `CANCELLED`.
2. Admin modification of UPI payment settings.
3. User activation or deactivation.
4. Product price, stock, or status deletion.
5. Admin authentication events (success/failure).
Log records contain timestamp, admin username/ID, action code, target entity ID, IP address, and changed attributes.
