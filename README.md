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

### 1. Backend (Spring Boot)
Requires Java 17+ and Maven 3.9+.

```bash
cd backend
mvn spring-boot:run
```
Backend runs at `http://localhost:8080`.

### 2. Frontend (React + Vite)
Requires Node.js 18+.

```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.
