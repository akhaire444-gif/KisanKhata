# KisanKhata Project Changelog

All notable changes to the KisanKhata backend and documentation are tracked here.

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
