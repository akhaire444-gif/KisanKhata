# KisanKhata — Deployment & Environment Configuration

## 1. Architecture Overview

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS (hosted on Vercel at `https://kisan-khata-x1dp.vercel.app/`).
- **Backend:** Spring Boot 3.4.5 + Java 17 + Spring Security 6 (hosted on Render at `https://kisankhata-1.onrender.com/`).
- **Authentication:**
  - **Google OAuth 2.0:** Server-side Authorization Code flow with Client ID + Secret.
  - **Local Email/Password:** Available for both Farmers and Marketplace Buyers.
  - **Session Model:** Spring Security session cookie (`JSESSIONID`, `HttpOnly`) with CSRF protection (`CookieCsrfTokenRepository.withHttpOnlyFalse()`).
- **Database:** H2 file-mode (local/dev) or managed PostgreSQL on production with `ddl-auto: update`.

---

## 2. Environment Variables

### Backend Environment Variables (Render / Production Host)

| Variable | Example Value | Description |
|---|---|---|
| `PORT` | `8080` | Internal server port (assigned automatically by Render) |
| `DATABASE_URL` | `jdbc:postgresql://host:5432/dbname` | Database JDBC URL |
| `DATABASE_USERNAME` | `dbuser` | Database username |
| `DATABASE_PASSWORD` | `dbpassword` | Database password |
| `FRONTEND_ORIGIN` | `https://kisan-khata-x1dp.vercel.app` | Allowed CORS frontend origin |
| `GOOGLE_CLIENT_ID` | `...apps.googleusercontent.com` | Google OAuth2 Web Client ID |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | Google OAuth2 Web Client Secret |
| `GOOGLE_REDIRECT_URI` | `https://kisankhata-1.onrender.com/login/oauth2/code/google` | Explicit OAuth redirect URI (fixes `redirect_uri_mismatch` on Render; defaults to `{baseUrl}/login/oauth2/code/google`) |
| `FORWARD_HEADERS_STRATEGY` | `native` | Proxy header strategy (`native` enables Tomcat's RemoteIpValve for `X-Forwarded-Proto`) |
| `BOOTSTRAP_ADMIN_EMAIL` | `admin@kisankhata.in` | Initial admin account email (seeded on first boot) |
| `BOOTSTRAP_ADMIN_PASSWORD` | *(min 12 characters)* | Initial admin account password |
| `SESSION_COOKIE_SAMESITE` | `none` | Cross-site cookie attribute for Vercel <-> Render integration |
| `SESSION_COOKIE_SECURE` | `true` | Secure HTTPS cookie flag |

> **Note on Authentication:** Google OAuth 2.0 operates via Spring Security's server-side Authorization Code flow. The Client Secret remains strictly on the backend. When users click "Continue with Google", the browser redirects to `/api/v1/auth/google/start?role=FARMER|BUYER`, connects to Google, receives the callback at `/login/oauth2/code/google`, exchanges the code, creates/links the user record, and establishes the authenticated Spring session.

### Frontend Environment Variables (Vercel)

| Variable | Example Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://kisankhata-1.onrender.com` | Production backend API base URL |

*(The client secret must NEVER be set on the frontend or in `VITE_*` variables).*

---

## 3. Google OAuth & Tenant Isolation Architecture

Kisan Khata provides authenticated multi-tenant isolation:

- **Start Endpoint:** `GET /api/v1/auth/google/start?role=FARMER|BUYER` (initiates Google OAuth2 code flow).
- **Callback Endpoint:** `GET /login/oauth2/code/google` (Spring Security OAuth2 client callback).
- **Profile Completion:** `PUT /api/v1/auth/profile` (authenticated, updates mobile, farmName, address, city, pinCode).
- **Tenant ID:** Assigned per user (`Farm-MH-XXXX`).
- **Security & Isolation:**
  - Zero demo accounts: Demo access and mock users are completely removed.
  - All database queries filter strictly by `farmerId` / `buyerId` from the authenticated session.
  - ADMIN role cannot be assigned through Google registration.

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
     java -jar target/kisankhata-backend-0.1.0.jar
     ```
3. Set the required backend environment variables.
   - Set `GOOGLE_REDIRECT_URI=https://<your-render-app>.onrender.com/login/oauth2/code/google` (guarantees HTTPS redirect URI behind Render's reverse proxy and avoids `redirect_uri_mismatch`).
   - `FORWARD_HEADERS_STRATEGY=native` is used by default to enable Tomcat's `RemoteIpValve` for `X-Forwarded-Proto`.
4. Add the backend redirect URI in Google Cloud Console:
   `https://<your-render-app>.onrender.com/login/oauth2/code/google`

### B. Frontend Deployment (Vercel)

1. **Root Directory:** `frontend`
2. **Build Command:** `npm run build`
3. **Output Directory:** `dist`
4. **Environment Variable:** `VITE_API_BASE_URL=https://<your-render-app>.onrender.com`

---

## 5. Verification Checklist

- [x] Login page loads with "Continue with Google", "Sign In", and "Register" buttons.
- [x] Demo account endpoints and UI elements completely removed.
- [x] Google sign-in works for Farmers and Buyers, establishing a real Spring session.
- [x] Profile completion modal triggers for users with missing mobile/delivery details.
- [x] Tenant data isolation verified: Users only access their own records.
- [x] Session restores cleanly on page refresh via `/api/v1/auth/me`.
