# KisanKhata Deployment & Operational Runbook

## 1. System Requirements & Platform Support
- **Backend Platform:** Render (Web Service), Railway, VPS (Ubuntu 22.04 LTS), or Windows Server.
- **Frontend Platform:** Vercel, Netlify, or Cloudflare Pages.
- **Java Runtime:** Eclipse Temurin OpenJDK 17 LTS or later (`java -version`).
- **Node.js Runtime (Frontend):** Node.js 18 LTS or later with npm 9+.
- **Database:** PostgreSQL (Render PostgreSQL / Supabase) or embedded persistent H2.
- **Memory:** Minimum 512 MB RAM (1 GB recommended).

---

## 2. Configuration & Environment Variables

### Backend Environment Variables (Render / Host)

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `8080` (or dynamically assigned by Render) | Backend HTTP listening port |
| `DATABASE_URL` | `jdbc:h2:file:./data/kisankhata;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE` | Database JDBC URL (Render sets PostgreSQL `jdbc:postgresql://...`) |
| `DATABASE_USERNAME` | `sa` | Database username |
| `DATABASE_PASSWORD` | *(empty)* | Database password |
| `FRONTEND_ORIGIN` | `https://kisan-khata-x1dp.vercel.app` | Allowed CORS origin (comma-separated for local dev: `http://localhost:5173,http://localhost:3000`) |
| `BOOTSTRAP_ADMIN_EMAIL` | `admin@kisankhata.in` | Initial admin account email (seeded on first boot) |
| `BOOTSTRAP_ADMIN_PASSWORD` | *(min 12 characters)* | Initial admin account password |
| `SESSION_COOKIE_SAMESITE` | `lax` (set to `none` for cross-origin Vercel) | SameSite attribute for `JSESSIONID` cookie (`none` required when frontend is on Vercel and backend is on Render) |
| `SESSION_COOKIE_SECURE` | `false` (set to `true` on Render HTTPS) | Secure attribute for cookie (`true` required when `SameSite=none`) |

> **Note on Authentication:** Google OAuth 2.0 has been completely removed. No Google Client ID, Google Secret, or Google Redirect URIs are required. Authentication operates via robust session cookies (`JSESSIONID`) supporting standard Farmer registration/login and the instantaneous One-Click Demo Mode.

### Frontend Environment Variables (Vercel)

| Variable | Example Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://kisankhata-1.onrender.com` | Production backend API base URL |

---

## 3. Demo Account & Tenant Isolation Architecture

Kisan Khata provides a zero-barrier **One-Click Demo Account** for agricultural demonstrations:

- **Endpoint:** `POST /api/v1/auth/demo` (public, requires no credentials or OTP).
- **Reset Endpoint:** `POST /api/v1/auth/demo/reset` (authenticated as demo user).
- **Tenant ID:** Dedicated demo tenant `DEMO-MH-TENANT`.
- **Demo User:** `demo.farmer@kisankhata.in` (Name: *Demo Farmer*, Farm: *Green Valley Demonstration Farm*, Sinnar, Nashik, Maharashtra).
- **Realistic Seeded Data:**
  - 4 Crops (Kharif Soybean, Rabi Onion, Pomegranate Orchard, Sugarcane Co-86032).
  - 8 Agricultural Expenses across Seeds, Fertilizers, Pesticides, Diesel, Machinery, Irrigation, and Other.
  - 6 Realistic Farm Workers (Rameshwar Chavan, Sunita Tai Patil, Bhaskar Rao Gite, Anita Dnyaneshwar Wagh, Datta Tukaram Shinde, Kailas Baburao Sanap) with daily wage rates (₹350 - ₹500/day) and attendance/wage records.
  - 7 Field Activity Records (irrigation logs, spray logs, crop reminders).
- **Security & Isolation:**
  - Demo user holds `ROLE_FARMER` and cannot access `/api/v1/admin/**` (returns HTTP 403 Forbidden).
  - All database queries filter strictly by `farmerId = demoUser.getId()`. Real farmer accounts are completely isolated and immune to demo modifications.
  - A convenient "Reset Sample Data" action allows restoring sample state at any point.

---

## 4. Build & Deployment Instructions

### A. Backend Deployment (Render)

1. **Repository:** Connect the repository to your Render Web Service.
2. **Environment:** Java / Docker / Native.
   - **Root Directory:** `backend`
   - **Build Command:**
     ```bash
     mvn clean package -DskipTests
     ```
   - **Start Command:**
     ```bash
     java -Dserver.port=$PORT -jar target/kisankhata-backend-0.1.0.jar
     ```
3. **Set Environment Variables in Render Dashboard:**
   - `PORT`: Automatically set by Render
   - `FRONTEND_ORIGIN`: `https://kisan-khata-x1dp.vercel.app`
   - `SESSION_COOKIE_SAMESITE`: `none`
   - `SESSION_COOKIE_SECURE`: `true`
   - `BOOTSTRAP_ADMIN_EMAIL`: `admin@kisankhata.in`
   - `BOOTSTRAP_ADMIN_PASSWORD`: `<strong-secret-password>`
   - (Optional) `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` if connecting a Render PostgreSQL database.
4. **Health Check Path:** `/actuator/health`

### B. Frontend Deployment (Vercel)

1. **Repository:** Connect the repository to Vercel.
2. **Framework Preset:** Vite
3. **Root Directory:** `frontend`
4. **Build & Output Settings:**
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. **Environment Variables in Vercel Dashboard:**
   - `VITE_API_BASE_URL`: `https://kisankhata-1.onrender.com`
6. Deploy!

---

## 5. Local Development Quickstart

### Backend
```bash
cd backend
mvn clean package -DskipTests
java -jar target/kisankhata-backend-0.1.0.jar
```
Backend runs on `http://localhost:8080`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## 6. Verification Checklist

- [x] Login page loads with "Sign In", "Register Farm", and "Explore Demo Account" buttons.
- [x] Google Sign-In elements and callback handlers completely removed.
- [x] Clicking "Explore Demo Account" grants immediate access to the dashboard without credentials.
- [x] Demo farm information displays *Green Valley Demonstration Farm* (Nashik, Maharashtra).
- [x] Full CRUD operations on agricultural expenses, crops, and farm workers work as expected.
- [x] Worker rozi wage calculations and pending payments calculate dynamically from database records.
- [x] Demo data isolation verified: Demo user cannot access admin APIs or real farmer data.
- [x] Demo reset button restores clean agricultural demo dataset on demand.
