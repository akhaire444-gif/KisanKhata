# KisanKhata (किसान खाता)

A comprehensive digital farm management and agri-marketplace platform.

## Project Structure

```text
KisanKhata-main/
├── backend/            # Java 17 / Spring Boot backend application
│   ├── src/
│   ├── pom.xml
│   └── README.md
├── frontend/           # React 18 / TypeScript / Vite frontend application
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docs/               # System architecture and technical specifications
├── architecture.png    # System architecture diagram
├── PRD.pdf             # Product Requirements Document
└── README.md
```

## Quick Start

### Quickest: One-Click Launch (Both Services)

Double-click `run.bat` or run:

```powershell
.\run-dev.ps1
```

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
npm install --legacy-peer-deps
npm run dev
```
Frontend runs at `http://localhost:3000` (auto-proxies `/api` to `http://localhost:8080`).

---

### Key URLs & Demo Credentials
- **Web App:** [http://localhost:3000](http://localhost:3000)
- **API & Actuator:** [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
- **Bootstrap Admin:** `admin@kisankhata.in` / `SecureAdminPassword2026!`
- **Demo Farmer:** Rajesh Patil (`Farm-MH-4012`)
