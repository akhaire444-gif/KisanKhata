# KisanKhata Spring Boot Backend

Java 17 / Spring Boot 3.4.5 multi-tenant modular-monolith agricultural ledger backend.

## Requirements
- Java 17+ (Eclipse Adoptium OpenJDK 17 recommended)
- Maven 3.9+ (bundled in `./mvnw` / `mvnw.cmd` and `maven/`)

## Environment Variables
Configure these in `backend/.env` or in your host environment:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Server listening port | `8080` |
| `DATABASE_URL` | JDBC Connection URL | H2 file under `./data/` |
| `FRONTEND_ORIGIN` | Allowed CORS frontend origin | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth2 Web Client ID | `(empty)` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 Web Client Secret | `(empty)` |
| `SESSION_COOKIE_SAMESITE`| Session cookie SameSite policy | `lax` (use `none` in cross-site prod) |
| `SESSION_COOKIE_SECURE` | Secure flag for JSESSIONID cookie | `false` (use `true` in HTTPS prod) |
| `BOOTSTRAP_ADMIN_EMAIL` | Optional initial admin email | `(empty)` |
| `BOOTSTRAP_ADMIN_PASSWORD` | Optional initial admin password | `(empty)` |

## Run Locally
```bash
cp .env.example .env
# Edit .env with your Google Client ID and Secret if testing Google Sign-In
.\mvnw.cmd spring-boot:run
```

## Build and Test
```bash
.\mvnw.cmd clean test
.\mvnw.cmd clean package
```

## Authentication Architecture
- **Google OAuth 2.0:** Server-side Authorization Code flow (`/api/v1/auth/google/start` -> `/oauth2/authorization/google` -> `/login/oauth2/code/google`). Generates verified session and links `AppUser`.
- **Local Email/Password:** `/api/v1/auth/register` (Farmer), `/api/v1/auth/register-buyer` (Buyer), `/api/v1/auth/login`.
- **Profile Completion:** `PUT /api/v1/auth/profile` (authenticated, updates mobile/farmName/address/pinCode with strict regex checks).
- **Session Management:** Spring Security session cookie (`JSESSIONID`, `HttpOnly`) with CSRF protection (`CookieCsrfTokenRepository.withHttpOnlyFalse()`).
- **No Demo Account:** The obsolete demo account has been completely removed; `DemoCleanupRunner` purges any legacy demo tenant on startup.

## Documentation
See `/docs` and `docs/GOOGLE_AUTH_SETUP.md` for complete API contract, architecture, and setup instructions.
