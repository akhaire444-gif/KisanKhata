# KisanKhata (किसान खाता)

A comprehensive multi-tenant digital farm management and agri-marketplace platform.

## Project Structure

```text
KisanKhata-main/
├── backend/            # Java 17 / Spring Boot backend application (Port 8080)
│   ├── src/
│   ├── pom.xml
│   └── README.md
├── frontend/           # React 19 / TypeScript / Vite frontend application (Port 3000)
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docs/               # System architecture and technical specifications
│   ├── GOOGLE_AUTH_SETUP.md # Google OAuth 2.0 configuration guide
│   └── API_CONTRACT.md # REST API Specification
├── run.bat             # Windows runner for both services
├── run-dev.ps1         # PowerShell runner for both services
└── README.md
```

## Quick Start

### Quickest: One-Click Launch (Both Services)

Double-click `run.bat` or run:

```powershell
.\run-dev.ps1
```

Both runners automatically detect and load environment variables from `backend/.env` if present.

---

### Manual Launch

#### 1. Backend (Spring Boot 3.4 + Java 17)
```bash
cd backend
.\mvnw.cmd spring-boot:run     # Windows
# or ./mvnw spring-boot:run     # Linux/macOS
```
Backend runs at `http://localhost:8080` (H2 Database + REST APIs).
Health Check: `http://localhost:8080/actuator/health`

#### 2. Frontend (React 19 + TypeScript + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:3000` (auto-proxies `/api` to `http://localhost:8080`).

### Authentication & Security
- **Google OAuth 2.0 ("Continue with Google"):** Server-side Authorization Code flow with Client ID + Secret. Automatic Farmer account provisioning and session management. See [docs/GOOGLE_AUTH_SETUP.md](docs/GOOGLE_AUTH_SETUP.md).
- **Email & Password:** Secure local registration and authentication for Farmers.
- **Farmer-Only Sign-Up:** New user onboarding is farmer-centric for digital farm accounting and crop ledger management.
- **Tenant Isolation:** Every farmer ledger is isolated by authenticated user ID; no demo bypass exists.
- **Admin Provisioning:** Configure `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` as environment variables.
