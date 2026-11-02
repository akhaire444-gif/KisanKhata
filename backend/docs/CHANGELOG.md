# KisanKhata Project Changelog

All notable changes to the KisanKhata backend and documentation are tracked here.

## [1.2.0] - 2026-11-02 (Google OAuth 2.0 Integration & Complete Demo Removal)

### Added
- **Google OAuth 2.0 Authentication (Server-Side Authorization Code Flow):**
  - Integrated `spring-boot-starter-oauth2-client` in `backend/pom.xml`.
  - Added `OAuth2ClientConfig` with conditional / safe placeholder client registration ensuring the backend boots cleanly even when Google credentials are not yet configured.
  - Implemented `GET /api/v1/auth/google/start?role=FARMER|BUYER` redirecting to `/oauth2/authorization/google` with session-scoped role preservation.
  - Implemented `OAuth2SuccessHandler` to verify `email_verified`, link existing accounts or register new accounts as `FARMER` / `BUYER`, prevent privilege escalation, issue Spring Security sessions (`JSESSIONID`), and redirect to the frontend with `profile=incomplete` if required.
  - Implemented `OAuth2FailureHandler` redirecting to the frontend with generic error codes.
  - Added `PUT /api/v1/auth/profile` allowing Google users and existing users to update/complete mobile, farmName, address, city, pinCode, state with validation.
  - Added "Continue with Google" button with official multicolor Google G logo SVG on both Sign In and Register views.
  - Added role picker (Farmer vs Buyer) in frontend registration.
  - Added `CompleteProfileModal` in frontend for instant post-login mobile and address completion.
  - Created setup guide: `docs/GOOGLE_AUTH_SETUP.md`.

### Removed
- **Complete Demo Account Purge:**
  - Removed `POST /api/v1/auth/demo` and `POST /api/v1/auth/demo/reset`.
  - Removed `DemoDataService.java`, `DemoAuthIntegrationTest.java`, and `DemoDataServiceTest.java`.
  - Added `DemoCleanupRunner` to automatically delete any existing `demo.farmer@kisankhata.in` user and all associated crops, expenses, workers, records, and orders on startup.
  - Removed all demo fallback constants, `loginDemo`, `resetDemoData`, and `isDemo` flags across the frontend (`AppContext.tsx`, `Header.tsx`, `HomePage.tsx`, `FarmerDashboard.tsx`, `types.ts`).

### Updated
- `AppUser` entity: added `googleSub`, `authProvider`, `pictureUrl`, nullable `passwordHash` and `mobile`, and `isProfileComplete()` helper.
- `SecurityConfig`: added OAuth2 login, updated permitAll and CSRF ignores, added cross-origin support for Google auth redirects.
- Test suite: added `OAuth2GoogleAuthTest.java` with 9 comprehensive integration tests (all 23 backend tests passing).

## [1.1.0] - 2026-10-21 (Full Core Backend, Marketplace, Admin & Integration)

### Added
- **Core Farmer Backend (Phase 2):**
  - Completed [CropController.java](file:///c:/Users/Anuj%20Khaire/Downloads/KisanKhata-main/backend/src/main/java/in/kisankhata/farm/CropController.java): injected `ExpenseRepository`, duplicate detection, `PUT /crops/{id}`, and cascade deletion protection.
  - Completed [ExpenseController.java](file:///c:/Users/Anuj%20Khaire/Downloads/KisanKhata-main/backend/src/main/java/in/kisankhata/farm/ExpenseController.java): `PUT /expenses/{id}`, optional crop and date range filters, and total expense calculation.
  - Completed [WorkerController.java](file:///c:/Users/Anuj%20Khaire/Downloads/KisanKhata-main/backend/src/main/java/in/kisankhata/farm/WorkerController.java): `PUT /workers/{id}`, UPI ID support, and server-side wage calculation using `RoundingMode.HALF_UP`.
  - Completed [FarmRecordController.java](file:///c:/Users/Anuj%20Khaire/Downloads/KisanKhata-main/backend/src/main/java/in/kisankhata/farm/FarmRecordController.java): water records, input records, future date reminder scheduling, and toggle completion endpoints.
  - Completed [ReportController.java](file:///c:/Users/Anuj%20Khaire/Downloads/KisanKhata-main/backend/src/main/java/in/kisankhata/farm/ReportController.java): summary counters, date-wise reports, crop-wise reports, and worker wage reports.
  - Connected [LoginAttemptService.java](file:///c:/Users/Anuj%20Khaire/Downloads/KisanKhata-main/backend/src/main/java/in/kisankhata/auth/LoginAttemptService.java) to [AuthController.java](file:///c:/Users/Anuj%20Khaire/Downloads/KisanKhata-main/backend/src/main/java/in/kisankhata/auth/AuthController.java) with HTTP 429 lockout after 5 consecutive failed attempts.
- **Marketplace & Orders (Phase 3):**
  - Implemented `Product`, `ProductRepository`, with public catalog endpoints.
  - Implemented `CartItem`, `CartItemRepository` with unique constraints per buyer.
  - Implemented `Order`, `OrderItem`, `OrderStatus` with atomic transactional checkout (`MarketplaceService.java`).
  - Implemented atomic SQL inventory deduction (`atomicDeductStock`) to prevent overselling race conditions.
  - Implemented buyer order history, manual UPI payment reporting (`POST /mart/orders/{id}/pay`), and order cancellation with stock restoration.
  - Implemented `PaymentSettings` entity and retrieval endpoint.
- **Admin & Audit Trail (Phase 4):**
  - Implemented `AdminController` with dashboard KPI metrics, user activation/deactivation, catalog CRUD, and payment settings.
  - Implemented `FileUploadService` with 1 MB limit, magic byte validation (JPEG, PNG, WebP), and safe UUID storage.
  - Implemented `FileDownloadController` to serve static uploaded files with cache headers.
  - Implemented `AuditLog` and `AuditLogRepository` to track sensitive administrative actions.
- **Testing (Phase 5):**
  - Added unit test suite for worker wage computation (`WorkerWageTest.java`).
  - Added unit test suite for login attempt throttling (`LoginAttemptServiceTest.java`).
  - Added unit test suite for inventory deduction and restock (`CheckoutInventoryTest.java`).
- **Frontend Integration (Phase 6):**
  - Created centralized API client [client.ts](file:///c:/Users/Anuj%20Khaire/Downloads/KisanKhata-main/frontend/src/api/client.ts) supporting credentials and auto-injected CSRF headers.
  - Connected `AppContext.tsx` and `AuthModals.tsx` to live backend authentication and endpoints with graceful offline fallback.

## [1.0.0] - 2026-10-21 (Audit & Architecture Stabilization)

### Added
- Comprehensive 33-page PRD extraction and architecture blueprint alignment.
- Full documentation suite under `/docs` (CONTEXT, REQUIREMENTS, ARCHITECTURE, API_CONTRACT, DATABASE, DECISIONS, BUSINESS_RULES, SECURITY, ERROR_HANDLING, VALIDATION, TESTING, DEPLOYMENT, CHANGELOG, TODO).

### Fixed
- Identified compilation error in `CropController.java` (`expenses.existsByCropIdAndFarmerId` without injected `ExpenseRepository`).
- Corrected password validation inconsistency (PRD specifies min 6 characters; DTO had min 8).
- Synchronized documentation between root `/docs` and `backend/docs`.
