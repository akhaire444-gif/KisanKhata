# KisanKhata Implementation Roadmap & Task Status

## Phase 1 — Project Audit, Baseline Architecture & Docs
- [x] Extract and thoroughly analyze `KisanKhata_PRD.pdf` (all 33 pages) and architecture blueprint.
- [x] Inspect existing React frontend structure, data contracts, routes, and local storage state.
- [x] Audit existing Spring Boot code, entities, and controllers.
- [x] Fix compilation issues and code inconsistencies in initial controller drafts.
- [x] Establish synchronized `/docs` documentation suite (CONTEXT, REQUIREMENTS, ARCHITECTURE, API_CONTRACT, DATABASE, DECISIONS, BUSINESS_RULES, SECURITY, ERROR_HANDLING, VALIDATION, TESTING, DEPLOYMENT, CHANGELOG, TODO).

## Phase 2 — Core Farmer Backend (Complete)
- [x] Fix and complete `CropController` (inject `ExpenseRepository`, add `PUT /crops/{id}`, duplicate crop validation).
- [x] Complete `ExpenseController` (add `PUT /expenses/{id}`, calculate totals, date and crop filtering).
- [x] Complete `WorkerController` (add `PUT /workers/{id}`, verify server wage calculation with `RoundingMode.HALF_UP`, add `upiId`).
- [x] Complete `FarmRecordController` (water, input records, reminders with future date validation and toggle endpoint).
- [x] Implement `ReportController` (Summary, Date-wise, Crop-wise, and Worker-wise reporting endpoints).
- [x] Implement `LoginAttemptService` (FR-AUTH-06: 5 failed attempts per 10 min rate limiting with 429 lockout).
- [x] Configure Spring Security with `CookieCsrfTokenRepository.withHttpOnlyFalse()` and cookie attributes.

## Phase 3 — Marketplace & Order Management (Complete)
- [x] Implement `Product` entity, repository, and public catalog endpoints (`/api/v1/mart/products`, `/api/v1/mart/products/{id}`).
- [x] Implement `CartItem` entity, repository, and buyer cart operations (`/api/v1/mart/cart` - GET, POST, PUT, DELETE).
- [x] Implement `Order` and `OrderItem` entities, repositories, and atomic transactional checkout (`/api/v1/mart/checkout`).
- [x] Implement anti-overselling inventory deduction with optimistic locking / SQL constraint check (`atomicDeductStock`).
- [x] Implement manual UPI payment reporting (`/api/v1/mart/orders/{id}/pay`), cancellation, and buyer order history (`/api/v1/mart/orders`).
- [x] Implement `PaymentSettings` entity and retrieval endpoint (`/api/v1/mart/payment-settings`).

## Phase 4 — Admin & Audit Trail (Complete)
- [x] Implement Admin catalog management (create, update, soft-delete products).
- [x] Implement secure file upload service (`/api/v1/admin/upload`, `/api/v1/files/{filename}`) with magic byte verification and 1 MB limit.
- [x] Implement Admin order fulfillment and manual UPI payment verification (`/api/v1/admin/orders/{id}/status`).
- [x] Implement Admin user listing and account activation/deactivation (`/api/v1/admin/users`, `PATCH /users/{id}/status`).
- [x] Implement Admin payment settings configuration (`/api/v1/admin/payment-settings`).
- [x] Implement `AuditLog` entity, repository, and sensitive operation logging (order status change, user deactivation, settings change).
- [x] Implement Admin dashboard KPI metrics (`/api/v1/admin/dashboard`).

## Phase 5 — Automated Testing & Verification (Complete)
- [x] Unit tests for worker wage calculation and update recalculation (`WorkerWageTest.java`).
- [x] Unit tests for rate limiting, 5-attempt lockout, and successful reset (`LoginAttemptServiceTest.java`).
- [x] Unit tests for inventory deduction, non-negativity constraint, and cancellation restock (`CheckoutInventoryTest.java`).
- [x] Spring Boot context loading test (`KisanKhataApplicationTests.java`).

## Phase 6 — Frontend Integration & Delivery (Complete)
- [x] Create centralized API client in React frontend (`src/api/client.ts`) with credentials and CSRF support.
- [x] Connect Farmer Dashboard and context to live Spring Boot backend with seamless offline fallback.
- [x] Connect Auth modals (login, register, logout) to live session endpoints.
- [x] Initialize static resources directory and operational deployment configuration for single-JAR delivery.
