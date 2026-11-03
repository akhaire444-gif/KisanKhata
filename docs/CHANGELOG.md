# KisanKhata Project Changelog

All notable changes to the KisanKhata backend and documentation are tracked here.

## [1.5.0] - 2026-11-03 (Complete 3D Farming UI Redesign & Category-Based Crop Selection)

### Added
- **3D Indian Living Farm & Animated Farmer Hero (`FarmHeroScene.tsx`):**
  - Integrated 3D stylized Indian farmer with procedural kinematics: cotton kurta, traditional dhoti, saffron gamcha/pagri, and wooden/iron farming tool (hoe).
  - Looping agricultural activity: natural body weight shift, bending forward to inspect crops, arm swinging with farming tool, and head tilting.
  - Realistic green agricultural furrows, raised soil ridges, and swaying crop foliage responding to wind physics.
  - Translucent irrigation canal with watery refraction alongside the crop beds.
  - Distant low-poly rolling hills, tree line, drifting fluffy clouds, and warm natural morning sunlight.
  - Damped camera parallax tracking cursor movement, with pointer-events disabled on the canvas so hero text, buttons, and Google authentication remain 100% accessible.
  - Automatic `IntersectionObserver` pause on scroll and Page Visibility pause on tab blur.
- **Context-Aware Category-Based Crop Selection (`cropCatalogue.ts` & `CropCategorySelector.tsx`):**
  - Comprehensive Indian crop catalogue categorized into **Fruits**, **Vegetables**, **Cereals & Grains**, **Pulses & Dal**, **Cash Crops**, and **Spices & Herbs**.
  - Localized bilingual names (English + Hindi/Marathi) with standard crop duration presets.
  - Dynamic `CropCategorySelector` inside `CropModal`: selecting a category immediately updates the available options.
  - Selecting any crop auto-fills crop name and default harvest duration in days.
  - In-category quick search and "Custom Variety" option for regional or specialized cultivars.
  - Filter tabs in the Crops Management dashboard allowing farmers to browse crops by category.
- **Worker Wage Formula Explainer:**
  - Added dedicated visual calculation formula banner: `Days Worked × Daily Wage = Total Payment (e.g., 10 days × ₹500/day = ₹5,000)`.

### Changed
- Updated `HomePage.tsx` hero headline: "Your Farm. Your Expenses. Your Growth." with agricultural value propositions and prominent action buttons.
- Cleaned up deprecated `HeroScene.tsx` in favor of the new comprehensive `FarmHeroScene.tsx`.
- Updated `docs/UI_DESIGN_SYSTEM.md` with 3D farm environment specifications and crop selection architecture.

## [1.4.0] - 2026-11-03 (Professional Glassy / Watery Redesign & 3D Animation System)

### Added
- **"Clear Water on a Green Field" Living Visual System:**
  - Layered living-water background (`#eaf6f0` → `#e3f1f4` → `#f4f8ff`) with 4 drifting blurred ambient orbs and subtle caustic SVG light texture.
  - Comprehensive glass utility system in `index.css`: `.glass`, `.glass-strong`, `.glass-subtle`, `.glass-dark`, `.glass-input`, `.glass-btn-primary`, `.glass-btn-secondary`, and `.water-shimmer`.
  - Created `frontend/src/components/WaterLoader.tsx`: Pulsing glass droplet loader with specular reflection for session verification.
  - Created `frontend/src/components/TiltCard.tsx`: Interactive 3D hover perspective tilt card with cursor-tracking specular glare effect.
  - Created `frontend/src/components/CountUp.tsx`: Smooth animated counter supporting formatted INR currency strings.
  - Created `docs/UI_DESIGN_SYSTEM.md`: Full architectural reference for design tokens, WebGL scene parameters, accessibility compliance, and print overrides.
- **Three.js / React Three Fiber 3D Hero Scene:**
  - Integrated `three`, `@react-three/fiber`, and `@react-three/drei` dynamically loaded via `React.lazy()` and `Suspense`.
  - Physically accurate `MeshPhysicalMaterial` water droplets with dynamic transmission, dispersion, and realistic 1.333 water index of refraction.
  - 3-point studio lighting with damped mouse parallax camera rotation.
  - Performance guards: `IntersectionObserver` auto-pauses rendering when out of viewport; Page Visibility API pauses rendering when inactive; WebGL capability check with `StaticHeroFallback.tsx`.

### Changed
- **Frontend Modernization across all screens (Visual-Only):**
  - Upgraded `Header.tsx` to `.glass-strong` with glossy active pill and translucent drawer navigation.
  - Upgraded `Footer.tsx` with `.glass-subtle` and living-water accents.
  - Upgraded `HomePage.tsx` with 3D hero scene, `TiltCard` feature cards, and shimmering action buttons.
  - Upgraded `AuthModals.tsx` (Sign In, Register, and Complete Profile) to `.glass-strong` with `.glass-input` and `.glass-btn-primary`.
  - Upgraded `FarmerDashboard.tsx` (all tabs: overview, crops, expenses, workers, fertilizers, reminders, reports, help):
    - Glass-styled tab navigation bar with glossy emerald active pill.
    - Overview KPIs with `TiltCard`, `CountUp`, and high-contrast `.glass-dark` card.
    - Quick Expense Khata banner and 7 Core Touch buttons wrapped in `TiltCard`.
    - All sub-modals (`CropModal`, `ExpenseModal`, `WorkerModal`, `FertilizerModal`, `ReminderModal`, and delete confirmation dialog) restyled with `.glass-strong`, `.glass-input`, and `.glass-btn-*`.
    - Clean tabular layouts with `.glass-subtle` zebra striping and sticky frosted headers.
    - Full `@media print` style overrides ensuring crisp white-paper A4 print fidelity with all glass and blurs disabled.
  - Upgraded `AboutAndContact.tsx` and `WateringReminderModal.tsx` to match the glass design system.
- Strict preservation of all business logic, API requests, routing, auth flows, validation, and state management.

## [1.3.0] - 2026-11-02 (Farmer-Only Sign-Up & Render Proxy Redirect Fix)

### Changed
- **Farmer-Only Registration:**
  - Removed buyer registration endpoint (`POST /api/v1/auth/register-buyer`) and `RegisterBuyerRequest` DTO.
  - Removed "Account Type" toggle (Farmer vs Buyer) and buyer-only form fields in frontend `AuthModals.tsx`.
  - Google OAuth sign-in flow now strictly provisions users as `ROLE_FARMER`.
  - Updated frontend `api.auth.getGoogleAuthUrl()` to omit role parameter.
  - Simplified `CompleteProfileModal` to focus exclusively on farm and contact details (mobile, farm name, location).
- **OAuth 2.0 Behind Reverse Proxy (Render Fix):**
  - Added configurable `GOOGLE_REDIRECT_URI` environment variable (defaults to `{baseUrl}/login/oauth2/code/google`).
  - Switched `server.forward-headers-strategy` to `native` with Tomcat `RemoteIpValve` (`X-Forwarded-Proto`, `X-Forwarded-For`).
  - Updated deployment instructions and Google Auth setup guides for Render.

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
