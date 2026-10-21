# KisanKhata Requirements Traceability Matrix

Source: `KisanKhata_PRD.pdf` (v1.0) and Architecture Blueprint.

## 1. Functional Requirements (FR)

| Req ID | Module | Priority | Description | Acceptance Criteria | Backend Implementation Status |
|---|---|---|---|---|---|
| FR-HOME-01 | Home | P0 | Public navigation | Entry points for Farmer & Mart; About & Contact | Handled by SPA / static routes |
| FR-HOME-02 | Home | P1 | Static About & Contact | Configurable contact info | Implemented in Frontend & Backend settings |
| FR-HOME-03 | Farmer | P0 | Farmer Home navigation | 8 core action buttons, greeting by name | Covered in frontend & API endpoints |
| FR-HOME-04 | Farmer | P1 | Help page | Plain language module instructions | Frontend static view |
| FR-AUTH-01 | Auth | P0 | Farmer registration | Name, 10-digit mobile, unique email, password min 6 chars | Implemented in `AuthController` |
| FR-AUTH-02 | Auth | P0 | Farmer/Buyer login | Email/password; generic error message on mismatch; disabled check | Implemented in `AuthController` |
| FR-AUTH-03 | Auth | P0 | Logout | Header logout button; invalidate session; protected redirect | Implemented via Spring Security `/api/v1/auth/logout` |
| FR-AUTH-04 | Auth | P0 | 30-min session timeout | Invalidate session after 30 mins inactivity | Configured in `application.yml` |
| FR-AUTH-05 | Security | P0 | Strict account isolation | Derived principal ID; reject cross-user access | Enforced in Services & Repositories |
| FR-AUTH-06 | Security | P1 | Login rate-limiting | 5 failed logins within 10 min blocks email for 10 min | Implemented via `LoginAttemptService` |
| FR-CROP-01 | Crops | P0 | Add crop | Name, category, valid date, duration (1-999), desc | Implemented in `CropController` |
| FR-CROP-02 | Crops | P0 | List crops | Farmer-scoped crop list, newest first | Implemented in `CropController` |
| FR-CROP-03 | Crops | P1 | Edit crop | Update existing crop with same validation | To implement in `CropController` |
| FR-CROP-04 | Crops | P0 | Delete crop | Reject deletion if crop has expenses | Implemented in `CropController` |
| FR-CROP-05 | Crops | P1 | Reject duplicate crop | Same name + plantation date for same farmer rejected | Implemented in `CropRepository` / Service |
| FR-EXP-01 | Expenses | P0 | Add expense | Details, date, farmer-owned cropId, amount (0.01 - 9,999,999) | Implemented in `ExpenseController` |
| FR-EXP-02 | Expenses | P0 | List expenses | Farmer-scoped list, newest first, total calculated | Implemented in `ExpenseController` |
| FR-EXP-03 | Expenses | P0 | Edit expense | Update expense details, amount, crop | To implement in `ExpenseController` |
| FR-EXP-04 | Expenses | P0 | Delete expense | Delete expense record after confirmation | Implemented in `ExpenseController` |
| FR-EXP-05 | Expenses | P0 | Duplicate submit prevention | Server transaction idempotency and frontend disable | Implemented |
| FR-WRK-01 | Workers | P0 | Add worker | Name, 10-digit mobile, days (0-366), daily wage (>0), upiId | Implemented in `WorkerController` |
| FR-WRK-02 | Workers | P0 | List workers | Farmer-scoped worker wage list | Implemented in `WorkerController` |
| FR-WRK-03 | Workers | P0 | Edit worker | Update days worked, daily wage, details | To implement in `WorkerController` |
| FR-WRK-04 | Workers | P0 | Delete worker | Worker removed from list and wage report | Implemented in `WorkerController` |
| FR-WRK-05 | Workers | P0 | Calculate wage on server | `paymentAmount = daysWorked * dailyWage` | Enforced in server-side entity & service |
| FR-WTR-01 | Water | P0 | Record irrigation | Plot name, with fertilizer (Y/N), qty + unit, date | Implemented in `FarmRecordController` |
| FR-WTR-02 | Water | P0 | List water records | Scoped, newest first | Implemented in `FarmRecordController` |
| FR-WTR-03 | Water | P0 | Delete water record | Delete after confirmation | Implemented in `FarmRecordController` |
| FR-PST-01 | Inputs | P0 | Record fertilizer/spray | Plot, product name, qty + unit (ml/kg), date | Implemented in `FarmRecordController` |
| FR-PST-02 | Inputs | P0 | List input records | Scoped, newest first | Implemented in `FarmRecordController` |
| FR-PST-03 | Inputs | P0 | Delete input record | Delete after confirmation | Implemented in `FarmRecordController` |
| FR-REM-01 | Reminders | P0 | Set reminder | Date, time, description (<=100 chars); must be future | Implemented in `FarmRecordController` |
| FR-REM-02 | Reminders | P0 | List reminders | Sorted by date/time, active first, done/past marked | Implemented in `FarmRecordController` |
| FR-REM-03 | Reminders | P0 | Delete reminder | Delete after confirmation | Implemented in `FarmRecordController` |
| FR-REM-04 | Reminders | P0 | Due-today banner | Highlight banner for today's reminders | Filtered via API & highlighted in UI |
| FR-RPT-01 | Reports | P0 | Date-wise report | Expenses within date range + total | To implement in `ReportController` |
| FR-RPT-02 | Reports | P0 | Crop-wise report | Expenses for selected crop + total | To implement in `ReportController` |
| FR-RPT-03 | Reports | P0 | Worker wage report | Worker days, daily wage, calculated total | To implement in `ReportController` |
| FR-RPT-04 | Reports | P1 | Print view | A4-optimized print stylesheet | Implemented in frontend |
| FR-MART-01 | Mart | P0 | Browse catalogue | Active products with image, name, price, stock | To implement in `ProductController` |
| FR-MART-02 | Mart | P0 | Buyer registration | First/last name, mobile, delivery address, email, pass | To implement in `AuthController` |
| FR-MART-03 | Mart | P0 | Buyer login/logout | Session auth for buyer | Implemented via role-aware auth |
| FR-MART-04 | Mart | P0 | Add to cart | Server-validated stock check; auto-increment qty | To implement in `CartController` |
| FR-MART-05 | Mart | P0 | View / update cart | Update qty, remove item, line totals & grand total | To implement in `CartController` |
| FR-MART-06 | Mart | P0 | Checkout & Order | Confirm address, phone, 6-digit PIN; atomic order + stock | To implement in `OrderController` |
| FR-MART-07 | Mart | P0 | Stock check at checkout | Prevent negative stock and race conditions | Enforced via transactional locking |
| FR-MART-08 | Mart | P0 | UPI payment page | Show UPI ID/QR, bill no, order total; "I have paid" | To implement in `PaymentController` |
| FR-MART-09 | Mart | P0 | Order Bill | Unique bill number, order snapshot with historical prices | Implemented in `Order` entity & bill API |
| FR-MART-10 | Mart | P1 | Buyer Order History | Buyer views own orders, newest first | To implement in `OrderController` |
| FR-MART-11 | Mart | P1 | Buyer Cancel Order | Cancel order while Pending Payment, restore stock | To implement in `OrderController` |
| FR-ADM-01 | Admin | P0 | Admin login | Setup-file bootstrapped admin; no public registration | Implemented in `BootstrapAdmin` |
| FR-ADM-02 | Admin | P0 | Admin session timeout | 30-min session timeout | Implemented in Spring Security |
| FR-ADM-03..06 | Admin | P0 | Product management | Add, list, edit, soft-delete products; image upload | To implement in `AdminProductController` |
| FR-ADM-07 | Admin | P0 | User listing | List registered farmers & buyers (no passwords) | To implement in `AdminUserController` |
| FR-ADM-08 | Admin | P1 | Deactivate/Reactivate | Toggle user active status; preserve past data | To implement in `AdminUserController` |
| FR-ADM-09 | Admin | P0 | Orders report | Filter by date range and status; total sales | To implement in `AdminOrderController` |
| FR-ADM-10 | Admin | P0 | Order verification | Mark Paid (from Pending/Reported) or Cancel (restore stock) | To implement in `AdminOrderController` |
| FR-ADM-11 | Admin | P0 | UPI Payment settings | Configure UPI ID, QR image, shop contact phone | To implement in `AdminPaymentSettingsController` |
| FR-ADM-12 | Admin | P1 | Admin Dashboard KPIs | Counts of farmers, buyers, products, orders | To implement in `AdminDashboardController` |

## 2. Non-Functional Requirements (NFR)
- **NFR-08 (Order & Stock Consistency):** Checkout and stock deduction must execute atomically in a single database transaction. Stock must never fall below zero.
- **NFR-10 (Password Storage):** BCrypt salted password hashing with minimum strength 12.
- **NFR-11 (Transport):** HTTPS support, `Secure`, `HttpOnly`, and `SameSite=Lax` session cookies.
- **NFR-12 (Input Handling):** Parameterized JPA queries, Jakarta Bean Validation on all DTOs, cross-site request forgery protection.
- **NFR-13 (Authorization):** Principal-derived tenant ownership checks on every protected entity read and mutation.
- **NFR-15 (File Upload):** File type inspection (magic bytes for PNG/JPEG), max 1 MB size, randomized stored filenames, no executable paths.
- **NFR-23 (Observability):** Rotating daily logs, sensitive data masking, `/actuator/health` endpoint.
- **NFR-26 (Single Package):** Production packaging into a single executable JAR runnable via `java -jar kisankhata.jar`.
